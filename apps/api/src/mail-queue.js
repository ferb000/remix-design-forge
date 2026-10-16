export async function saveSubmission(pool,kind,data,mailEnabled) {
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    if(kind==='bookings') {
      await client.query("INSERT INTO bookings(id,data,reserved_range) VALUES($1,$2,tstzrange($3,$4,'[)'))",[data.id,data,data.startsAt,data.endsAt]);
    } else {
      await client.query('INSERT INTO inquiries(id,data) VALUES($1,$2)',[data.id,data]);
    }
    if(mailEnabled) {
      const payload={id:data.id,name:data.name,...(kind==='bookings'?{serviceName:data.serviceName,date:data.date,time:data.time}:{})};
      await client.query('INSERT INTO email_outbox(id,kind,recipient,payload) VALUES($1,$2,$3,$4)',['confirmation-'+data.id,kind,data.email,payload]);
    }
    await client.query('COMMIT');
  } catch(error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

export async function deliverNext(pool,mailer,logger=console) {
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const result=await client.query("SELECT * FROM email_outbox WHERE status='pending' AND next_attempt_at<=now() ORDER BY created_at,id LIMIT 1 FOR UPDATE SKIP LOCKED");
    if(!result.rowCount) { await client.query('COMMIT'); return false; }
    const job=result.rows[0];
    try {
      await mailer.send(job);
      await client.query("UPDATE email_outbox SET status='sent',attempts=attempts+1,sent_at=now(),last_error=NULL WHERE id=$1",[job.id]);
    } catch(error) {
      const attempts=job.attempts+1;
      const code=/^[A-Z0-9_]{1,40}$/.test(error.code || '')?error.code:'SMTP_ERROR';
      await client.query("UPDATE email_outbox SET status=$1,attempts=$2,last_error=$3,next_attempt_at=now()+($4::int*interval '1 second') WHERE id=$5",[attempts>=5?'failed':'pending',attempts,code,60*2**(attempts-1),job.id]);
      logger.error('Confirmation email delivery failed:',job.id,code,attempts>=5?'manual retry required':'retry scheduled');
    }
    await client.query('COMMIT');
    return true;
  } catch(error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

export function startMailWorker(pool,mailer,logger=console) {
  if(!mailer.enabled) { logger.info('SMTP is disabled. Configure SMTP_ENABLED=true to send confirmation emails.'); return {async stop(){}}; }
  let stopped=false;
  let running;
  const tick=()=>{
    if(stopped || running) return;
    running=(async()=>{
      for(let i=0;i<10 && !stopped;i++) if(!await deliverNext(pool,mailer,logger)) break;
    })().catch(()=>logger.error('Email queue worker could not process the queue.')).finally(()=>{running=undefined;});
  };
  const timer=setInterval(tick,5000);
  tick();
  return {async stop(){stopped=true;clearInterval(timer);await running;mailer.close();}};
}
