import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import pg from 'pg';
import { Readable } from 'node:stream';
import { createPool } from '../src/db.js';
import { migrate } from '../src/db.js';
import { setup } from '../src/setup.js';
import { createApp } from '../src/app.js';
import { deliverNext, saveSubmission } from '../src/mail-queue.js';

test('existing website and admin flows persist through the real PostgreSQL API', async t => {
  const connectionString=process.env.TEST_DATABASE_URL && !process.env.TEST_DATABASE_URL.includes('YOUR_PASSWORD') ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  const control=createPool(connectionString);
  // Every test run owns a unique schema. Existing application tables are untouched.
  const schema='test_'+randomUUID().replaceAll('-','');
  await control.query(`CREATE SCHEMA "${schema}"`);
  const pool=new pg.Pool({connectionString,options:`-c search_path=${schema}`});
  const uploadsDir=await mkdtemp(path.join(tmpdir(),'design-forge-api-'));
  let server;
  let base;
  let clock=Date.parse('2026-10-11T12:00:00Z');
  const start=async()=>{
    const app=createApp({pool,uploadsDir,mailEnabled:true,publicUrl:'http://localhost:3002',now:()=>clock});
    server=app.listen(0,'127.0.0.1');
    await new Promise(resolve=>server.once('listening',resolve));
    base='http://127.0.0.1:'+server.address().port;
  };
  const stop=()=>new Promise(resolve=>server.close(resolve));
  async function call(endpoint,method='GET',body,token) {
    const multipart=body instanceof FormData;
    const response=await fetch(base+endpoint,{method,headers:{...(!multipart?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:multipart?body:JSON.stringify(body)});
    return {status:response.status,json:await response.json()};
  }
  try {
    await setup(pool); await start();
    let token,projectId,clientId,inquiryId,bookingId;
    const project={title:'Integration Render',category:'still-images',architect:'Existing Architect',location:'Test Location',year:'2026',description:'Existing project fields',image:'https://example.com/render.jpg',aspectRatio:'16:9',pipeline:'CGI'};
    await t.test('health, CORS, and existing portfolio seeds',async()=>{
      assert.equal((await call('/api/health')).status,200);
      const projects=await call('/api/projects'); assert.equal(projects.json.data.length,24);
      assert.equal((await call('/api/clients')).json.data.length,15);
      const image=new URL(projects.json.data.find(p=>p.image.includes('/assets/')).image).pathname;
      assert.equal((await fetch(base+image)).status,200);
      const cors=await fetch(base+'/api/health',{method:'OPTIONS',headers:{Origin:'http://localhost:3000','Access-Control-Request-Headers':'Authorization'}});
      assert.equal(cors.status,204); assert.equal(cors.headers.get('access-control-allow-origin'),'http://localhost:3000');
      assert.equal((await fetch(base+'/api/health',{headers:{Origin:'https://untrusted.example'}})).status,403);
    });
    await t.test('S3 portfolio images stream publicly while missing and unsafe keys are rejected',async()=>{
      const media=createApp({pool,uploadsDir,storage:{async read(name){
        if(name!=='render.png') throw Object.assign(new Error('Not found'),{name:'NoSuchKey'});
        return {Body:Readable.from(Buffer.from('image-data')),ContentType:'image/png',ContentLength:10};
      }}}).listen(0,'127.0.0.1');
      await new Promise(resolve=>media.once('listening',resolve));
      const url='http://127.0.0.1:'+media.address().port;
      try {
        const res=await fetch(url+'/api/media/render.png');
        assert.equal(res.status,200); assert.equal(await res.text(),'image-data');
        assert.equal(res.headers.get('content-type'),'image/png');
        assert.match(res.headers.get('content-security-policy'),/sandbox/);
        assert.equal((await fetch(url+'/api/media/missing.png')).status,404);
      } finally { await new Promise(resolve=>media.close(resolve)); }
      assert.equal((await call('/api/media/render.png')).status,404);
    });
    await t.test('private endpoints and mutations require a real session',async()=>{
      for(const url of ['/api/inquiries','/api/bookings','/api/auth/session']) assert.equal((await call(url)).status,401);
      assert.equal((await call('/api/projects','POST',project,'jwt-mock-123')).status,401);
      assert.equal((await call('/api/clients/altura','DELETE')).status,401);
    });
    await t.test('login validates credentials and returns existing user shape',async()=>{
      assert.equal((await call('/api/auth/login','POST',{email:process.env.ADMIN_EMAIL,password:'wrong'})).status,401);
      const login=await call('/api/auth/login','POST',{email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD});
      assert.equal(login.status,200); token=login.json.token;
      assert.equal(login.json.user.role,'super_admin'); assert.ok(login.json.expiresAt>Date.now());
      assert.equal((await call('/api/auth/session','GET',undefined,token)).json.data.email,process.env.ADMIN_EMAIL.toLowerCase());
    });
    await t.test('production cookie sessions are HttpOnly, secure, and reject forged or cross-site writes',async()=>{
      const secured=createApp({pool,uploadsDir,production:true,publicUrl:'https://studio.example.com',origins:['https://studio.example.com']}).listen(0,'127.0.0.1');
      await new Promise(resolve=>secured.once('listening',resolve));
      const url='http://127.0.0.1:'+secured.address().port;
      try {
        const response=await fetch(url+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://studio.example.com'},body:JSON.stringify({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD})});
        const json=await response.json(); assert.equal(json.token,undefined);
        const cookie=response.headers.get('set-cookie');
        assert.match(cookie,/HttpOnly/); assert.match(cookie,/Secure/); assert.match(cookie,/SameSite=Strict/);
        const session=cookie.split(';')[0];
        assert.equal((await fetch(url+'/api/auth/session',{headers:{Cookie:session}})).status,200);
        assert.equal((await fetch(url+'/api/auth/session',{headers:{Cookie:'studio_session='+ 'f'.repeat(64)}})).status,401);
        assert.equal((await fetch(url+'/api/auth/logout',{method:'POST',headers:{Cookie:session}})).status,403);
        assert.equal((await fetch(url+'/api/auth/logout',{method:'POST',headers:{Cookie:session,Origin:'https://evil.example'}})).status,403);
        const logout=await fetch(url+'/api/auth/logout',{method:'POST',headers:{Cookie:session,Origin:'https://studio.example.com'}});
        assert.equal(logout.status,200);
        assert.equal((await fetch(url+'/api/auth/session',{headers:{Cookie:session}})).status,401);
      } finally { await new Promise(resolve=>secured.close(resolve)); }
    });
    await t.test('container proxy trusts the closest Nginx hop without trusting extra forwarded addresses',async()=>{
      const proxy=createApp({pool,uploadsDir,trustProxy:1}).listen(0,'127.0.0.1');
      await new Promise(resolve=>proxy.once('listening',resolve));
      const url='http://127.0.0.1:'+proxy.address().port;
      const login=forwarded=>fetch(url+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':forwarded},body:JSON.stringify({email:'unknown@example.com',password:'invalid'})});
      try {
        for(let attempt=0;attempt<10;attempt++) assert.equal((await login('198.51.100.1, 203.0.113.42')).status,401);
        assert.equal((await login('198.51.100.2, 203.0.113.42')).status,429);
        assert.equal((await login('198.51.100.2, 203.0.113.43')).status,401);
      } finally { await new Promise(resolve=>proxy.close(resolve)); }
    });
    await t.test('publish, read, update projects and validate inputs',async()=>{
      const result=await call('/api/projects','POST',project,token); assert.equal(result.status,201); projectId=result.json.data.id;
      assert.equal((await call('/api/projects/'+projectId)).json.data.title,project.title);
      assert.equal((await call('/api/projects/'+projectId,'PUT',{title:'Updated Render'},token)).json.data.title,'Updated Render');
      assert.equal((await call('/api/projects','POST',{...project,category:'unknown'},token)).status,400);
      assert.equal((await call('/api/projects/'+projectId,'PUT',{id:'hijack'},token)).json.data.id,projectId);
      assert.equal((await call('/api/projects/missing','PUT',{title:'x'},token)).status,404);
    });
    await t.test('multipart project image and logo uploads are public',async()=>{
      const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5d8AAAAASUVORK5CYII=','base64');
      const form=new FormData(); form.append('project',JSON.stringify(project)); form.append('image',new Blob([png],{type:'image/png'}),'render.png');
      const saved=await call('/api/projects','POST',form,token); assert.equal(saved.status,201);
      assert.equal((await fetch(base+new URL(saved.json.data.image).pathname)).status,200);
      const logo=new FormData(); logo.append('client',JSON.stringify({name:'TEST STUDIO',subtitle:'TEST'})); logo.append('logo',new Blob([png],{type:'image/png'}),'logo.png');
      const client=await call('/api/clients','POST',logo,token); assert.equal(client.status,201); clientId=client.json.data.id;
      assert.ok(client.json.data.logoUrl.includes('/uploads/'));
      const bad=new FormData(); bad.append('file',new Blob(['<svg><script>alert(1)</script></svg>'],{type:'image/svg+xml'}),'bad.svg');
      assert.equal((await call('/api/upload','POST',bad,token)).status,400);
      const malformed=new FormData(); malformed.append('project','{');
      assert.equal((await call('/api/projects','POST',malformed,token)).status,400);
    });
    await t.test('website inquiries appear in admin inbox and statuses persist',async()=>{
      const submitted=await call('/api/inquiries','POST',{name:'Client',email:'client@example.com',message:'Existing contact form',status:'archived'});
      assert.equal(submitted.status,201); assert.equal(submitted.json.data.received,true); inquiryId=submitted.json.data.id;
      const inbox=await call('/api/inquiries','GET',undefined,token); assert.equal(inbox.json.data[0].status,'new');
      assert.equal((await call('/api/inquiries/'+inquiryId,'PATCH',{status:'reviewed'},token)).json.data.status,'reviewed');
      assert.equal((await call('/api/inquiries/'+inquiryId,'PATCH',{status:'bad'},token)).status,400);
      assert.equal((await call('/api/inquiries','POST',{name:'Client',email:'invalid',message:'Test'})).status,400);
    });
    await t.test('website bookings retain scheduler data for admin',async()=>{
      const submitted=await call('/api/bookings','POST',{serviceId:'cinematic-cgi',serviceName:'Cinematic CGI',date:'2026-10-12',time:'14:00 CET',name:'Client',email:'client@example.com',role:'Lead Architect',notes:'Notes',projectName:'Existing project',firmName:'Firm',location:'City',budget:'$10k - $25k',timeline:'Within 30 Days'});
      assert.equal(submitted.status,201); bookingId=submitted.json.data.reservationId;
      const bookings=await call('/api/bookings','GET',undefined,token);
      assert.equal(bookings.json.data[0].id,bookingId); assert.equal(bookings.json.data[0].status,'confirmed'); assert.equal(bookings.json.data[0].projectName,'Existing project');
    });
    await t.test('availability shows upcoming weekdays without exposing booking details',async()=>{
      const result=await call('/api/bookings/availability'); assert.equal(result.status,200);
      assert.equal(result.json.data.durationMinutes,30); assert.equal(result.json.data.timeZone,'CET (UTC+01:00)');
      const dates=result.json.data.dates;
      assert.equal(dates[0].date,'2026-10-12');
      assert.ok(dates.every(day=>![0,6].includes(new Date(day.date).getUTCDay())));
      assert.equal(dates[0].slots.find(slot=>slot.time==='14:00 CET').available,false);
      assert.equal(dates[0].slots.find(slot=>slot.time==='10:00 CET').startsAt,'2026-10-12T09:00:00.000Z');
      assert.ok(!JSON.stringify(result.json).includes('client@example.com'));
      const res=await fetch(base+'/api/bookings/availability'); assert.equal(res.headers.get('cache-control'),'no-store');
    });
    await t.test('past, weekend, impossible dates, off-schedule times, and distant bookings are rejected',async()=>{
      const payload={serviceId:'cinematic-cgi',serviceName:'CGI',date:'2026-10-12',time:'10:00 CET',name:'Client',email:'client@example.com'};
      for(const updates of [{date:'2026-10-10'},{date:'2026-10-17'},{date:'2026-11-10'},{date:'2026-02-30'},{time:'10:15 CET'},{time:'10:00 GMT'},{time:'25:00 CET'}]) {
        assert.equal((await call('/api/bookings','POST',{...payload,...updates})).status,400);
      }
      clock=Date.parse('2026-10-12T09:00:00Z');
      assert.equal((await call('/api/bookings','POST',payload)).status,400);
      assert.ok(!(await call('/api/bookings/availability')).json.data.dates[0].slots.some(slot=>slot.time==='10:00 CET'));
      clock=Date.parse('2026-10-11T12:00:00Z');
    });
    await t.test('simultaneous reservations across services allow exactly one winner',async()=>{
      const payload={serviceId:'cinematic-cgi',serviceName:'CGI',date:'2026-10-13',time:'10:00 CET',name:'Client',email:'client@example.com'};
      const results=await Promise.all([call('/api/bookings','POST',payload),call('/api/bookings','POST',{...payload,serviceId:'showreel-animation',serviceName:'Film'})]);
      assert.deepEqual(results.map(result=>result.status).sort(),[201,409]);
      assert.match(results.find(result=>result.status===409).json.message,/choose another time/i);
      assert.equal((await call('/api/bookings/availability')).json.data.dates.find(day=>day.date===payload.date).slots.find(slot=>slot.time===payload.time).available,false);
    });
    await t.test('partially overlapping reservations block slots, while adjacent intervals are allowed',async()=>{
      const data={id:'existing-partial',date:'2026-10-13',time:'11:45 CET',status:'pending'};
      await pool.query("INSERT INTO bookings(id,data,reserved_range) VALUES($1,$2,tstzrange($3,$4,'[)'))",[data.id,data,'2026-10-13T10:45:00Z','2026-10-13T11:15:00Z']);
      const payload={serviceId:'cinematic-cgi',serviceName:'CGI',date:'2026-10-13',time:'11:30 CET',name:'Client',email:'client@example.com'};
      assert.equal((await call('/api/bookings','POST',payload)).status,409);
      assert.equal((await call('/api/bookings/availability')).json.data.dates.find(day=>day.date===payload.date).slots.find(slot=>slot.time===payload.time).available,false);
      await assert.rejects(pool.query("INSERT INTO bookings(id,data,reserved_range) VALUES('overlap',$1,tstzrange($2,$3,'[)'))",[{status:'confirmed'},'2026-10-13T09:15:00Z','2026-10-13T09:45:00Z']),error=>error.code==='23P01');
      await pool.query("INSERT INTO bookings(id,data,reserved_range) VALUES('adjacent',$1,tstzrange($2,$3,'[)'))",[{status:'confirmed'},'2026-10-13T09:30:00Z','2026-10-13T10:00:00Z']);
    });
    await t.test('existing bookings are migrated into availability without losing their details',async()=>{
      await pool.query('ALTER TABLE bookings ALTER COLUMN reserved_range DROP NOT NULL');
      const legacy={id:'legacy-booking',date:'2026-10-15',time:'16:00 CET',status:'confirmed',name:'Legacy Client',email:'legacy@example.com'};
      await pool.query('INSERT INTO bookings(id,data) VALUES($1,$2)',[legacy.id,legacy]);
      await migrate(pool);
      const saved=await pool.query('SELECT data,lower(reserved_range) AS start FROM bookings WHERE id=$1',[legacy.id]);
      assert.equal(saved.rows[0].data.name,legacy.name);
      assert.equal(saved.rows[0].data.startsAt,'2026-10-15T15:00:00.000Z');
      assert.equal((await call('/api/bookings/availability')).json.data.dates.find(day=>day.date===legacy.date).slots.find(slot=>slot.time===legacy.time).available,false);
    });
    await t.test('completed reservations do not occupy availability',async()=>{
      await pool.query("INSERT INTO bookings(id,data,reserved_range) VALUES('completed',$1,tstzrange($2,$3,'[)'))",[{status:'completed'},'2026-10-14T09:00:00Z','2026-10-14T09:30:00Z']);
      assert.equal((await call('/api/bookings/availability')).json.data.dates.find(day=>day.date==='2026-10-14').slots.find(slot=>slot.time==='10:00 CET').available,true);
    });
    await t.test('confirmed bookings and inquiries queue emails, conflicts and invalid requests do not',async()=>{
      const jobs=await pool.query('SELECT * FROM email_outbox');
      assert.ok(jobs.rows.some(job=>job.kind==='bookings' && job.payload.id===bookingId));
      assert.ok(jobs.rows.some(job=>job.kind==='inquiries' && job.payload.id===inquiryId));
      assert.ok(jobs.rows.every(job=>job.status==='pending' && job.attempts===0));
      const reserved=await pool.query("SELECT count(*) FROM bookings WHERE data->>'date'='2026-10-13' AND data->>'time'='10:00 CET'");
      assert.equal(Number(reserved.rows[0].count),1);
      assert.equal(jobs.rows.filter(job=>job.kind==='bookings' && job.payload.date==='2026-10-13' && job.payload.time==='10:00 CET').length,1);
      assert.ok(jobs.rows.every(job=>!('notes' in job.payload) && !('message' in job.payload)));
    });
    await t.test('submission rolls back if its confirmation cannot be durably queued',async()=>{
      await pool.query('INSERT INTO email_outbox(id,kind,recipient,payload) VALUES($1,$2,$3,$4)',['confirmation-atomic-check','inquiries','visitor@example.com',{}]);
      await assert.rejects(saveSubmission(pool,'inquiries',{id:'atomic-check',name:'Visitor',email:'visitor@example.com',message:'test'},true));
      assert.equal((await pool.query("SELECT id FROM inquiries WHERE id='atomic-check'")).rowCount,0);
    });
    await t.test('SMTP failure preserves submissions and retries the persisted email',async()=>{
      await pool.query("UPDATE email_outbox SET status='sent'");
      await saveSubmission(pool,'inquiries',{id:'retry-check',name:'Visitor',email:'visitor@example.com',message:'Saved despite SMTP outage'},true);
      const logger={error(){}};
      await deliverNext(pool,{async send(){throw Object.assign(new Error('Do not log SMTP credentials'),{code:'EAUTH'});}},logger);
      let row=(await pool.query("SELECT * FROM email_outbox WHERE id='confirmation-retry-check'")).rows[0];
      assert.equal(row.status,'pending');assert.equal(row.attempts,1);assert.equal(row.last_error,'EAUTH');
      assert.ok(row.next_attempt_at > new Date());
      assert.equal((await pool.query("SELECT id FROM inquiries WHERE id='retry-check'")).rowCount,1);
      await pool.query("UPDATE email_outbox SET next_attempt_at=now() WHERE id='confirmation-retry-check'");
      await deliverNext(pool,{async send(){}},logger);
      row=(await pool.query("SELECT * FROM email_outbox WHERE id='confirmation-retry-check'")).rows[0];
      assert.equal(row.status,'sent');assert.equal(row.attempts,2);assert.ok(row.sent_at);
    });
    await t.test('concurrent workers do not process the same email, and five failures stop automatic retries',async()=>{
      await saveSubmission(pool,'inquiries',{id:'worker-check',name:'Visitor',email:'visitor@example.com',message:'Test'},true);
      let sends=0;
      const mailer={async send(){sends++;await new Promise(resolve=>setTimeout(resolve,25));}};
      const processed=await Promise.all([deliverNext(pool,mailer),deliverNext(pool,mailer)]);
      assert.equal(sends,1);assert.deepEqual(processed.sort(),[false,true]);
      await saveSubmission(pool,'inquiries',{id:'failed-check',name:'Visitor',email:'visitor@example.com',message:'Test'},true);
      await pool.query("UPDATE email_outbox SET attempts=4 WHERE id='confirmation-failed-check'");
      await deliverNext(pool,{async send(){throw Object.assign(new Error('Rejected'),{code:'EENVELOPE'});}},{error(){}});
      const row=(await pool.query("SELECT * FROM email_outbox WHERE id='confirmation-failed-check'")).rows[0];
      assert.equal(row.status,'failed');assert.equal(row.attempts,5);
      assert.equal(await deliverNext(pool,mailer),false);
    });
    await t.test('database records and login survive server restart without reseeding',async()=>{
      await saveSubmission(pool,'inquiries',{id:'restart-mail-check',name:'Visitor',email:'visitor@example.com',message:'Keep this pending confirmation',status:'new',submittedAt:new Date().toISOString()},true);
      await stop(); await setup(pool); await start();
      const queued=await pool.query("SELECT status,attempts FROM email_outbox WHERE id='confirmation-restart-mail-check'");
      assert.deepEqual(queued.rows,[{status:'pending',attempts:0}]);
      assert.equal((await call('/api/projects/'+projectId)).json.data.title,'Updated Render');
      assert.equal((await call('/api/inquiries','GET',undefined,token)).json.data.find(i=>i.id===inquiryId).status,'reviewed');
      assert.ok((await call('/api/bookings','GET',undefined,token)).json.data.some(booking=>booking.id===bookingId));
      assert.equal((await call('/api/bookings/availability')).json.data.dates[0].slots.find(slot=>slot.time==='14:00 CET').available,false);
    });
    await t.test('deletions remain deleted after setup runs again',async()=>{
      assert.equal((await call('/api/projects/'+projectId,'DELETE',undefined,token)).status,200);
      assert.equal((await call('/api/clients/'+clientId,'DELETE',undefined,token)).status,200);
      await call('/api/clients/altura','DELETE',undefined,token); await setup(pool);
      assert.equal((await call('/api/clients/altura')).status,404);
      assert.equal((await call('/api/projects/'+projectId)).status,404);
    });
    await t.test('logout revokes session and expired tokens cannot authenticate',async()=>{
      assert.equal((await call('/api/auth/logout','POST',undefined,token)).status,200);
      assert.equal((await call('/api/auth/session','GET',undefined,token)).status,401);
      const login=await call('/api/auth/login','POST',{email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD});
      await pool.query("UPDATE sessions SET expires_at=now()-interval '1 second'");
      assert.equal((await call('/api/auth/session','GET',undefined,login.json.token)).status,401);
    });
  } finally {
    if(server?.listening) await stop(); await pool.end();
    await control.query(`DROP SCHEMA "${schema}" CASCADE`); await control.end();
    await rm(uploadsDir,{recursive:true,force:true});
  }
});
