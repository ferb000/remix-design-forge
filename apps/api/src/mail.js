import nodemailer from 'nodemailer';

const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export function smtpOptions(env=process.env) {
  if (!['true','false',undefined,''].includes(env.SMTP_ENABLED)) throw new Error('SMTP_ENABLED must be true or false.');
  if (env.SMTP_ENABLED !== 'true') return null;
  const port=Number(env.SMTP_PORT || 587);
  if (!env.SMTP_HOST || !emailPattern.test(env.SMTP_FROM || '') || !Number.isInteger(port) || port<1 || port>65535) throw new Error('SMTP requires SMTP_HOST, a valid SMTP_PORT, and an email address in SMTP_FROM.');
  if (!['true','false',undefined,''].includes(env.SMTP_SECURE)) throw new Error('SMTP_SECURE must be true or false.');
  if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASS)) throw new Error('Set both SMTP_USER and SMTP_PASS, or neither for an authorized relay.');
  if (env.SMTP_REPLY_TO && !emailPattern.test(env.SMTP_REPLY_TO)) throw new Error('SMTP_REPLY_TO must be an email address.');
  const secure=env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port===465;
  return { host:env.SMTP_HOST,port,secure,requireTLS:!secure,
    auth:env.SMTP_USER?{user:env.SMTP_USER,pass:env.SMTP_PASS}:undefined,
    connectionTimeout:5000,greetingTimeout:5000,socketTimeout:15000,
    tls:{minVersion:'TLSv1.2'},disableFileAccess:true,disableUrlAccess:true };
}

export function confirmation(kind,data) {
  const booking=kind==='bookings';
  if(data.audience==='admin') {
    const subject=booking?'New Design Forge consultation':'New Design Forge inquiry';
    const labels={name:'Name',email:'Email',phone:'Phone',message:'Inquiry',serviceName:'Service',date:'Date',time:'Time',projectName:'Project',firmName:'Firm',notes:'Notes',id:'Reference'};
    const text=Object.entries(labels).filter(([key])=>data[key]).map(([key,label])=>label+': '+data[key]).join('\n\n');
    return {subject,text,html:'<div><h1>'+escapeHtml(subject)+'</h1>'+text.split('\n\n').map(line=>'<p>'+escapeHtml(line)+'</p>').join('')+'</div>'};
  }
  const subject=booking?'Your Design Forge consultation is confirmed':'We received your Design Forge inquiry';
  const lines=booking
    ? [`Hello ${data.name},`,'Your 30-minute consultation is confirmed.',`Service: ${data.serviceName}`,`Date: ${data.date}`,`Time: ${data.time}`,`Reference: ${data.id}`,'Please reply to this email if you need help with your reservation.']
    : [`Hello ${data.name},`,'Thank you for contacting Design Forge. We have received your inquiry and our studio will follow up with you.',`Reference: ${data.id}`,'Please reply to this email if you need to add anything to your inquiry.'];
  return {subject,text:lines.join('\n\n'),html:`<div style="font-family:Arial,sans-serif;line-height:1.6"><h1 style="font-size:22px">${escapeHtml(subject)}</h1>${lines.map(line=>`<p>${escapeHtml(line)}</p>`).join('')}<p>Design Forge Studio</p></div>`};
}

export function createMailer(env=process.env,transport) {
  const options=smtpOptions(env);
  if(!options) return {enabled:false,close(){}};
  const smtp=transport || nodemailer.createTransport(options);
  const from={name:env.SMTP_FROM_NAME || 'Design Forge',address:env.SMTP_FROM};
  return { enabled:true,
    verify:()=>smtp.verify(),
    async send(job) {
      const result=await smtp.sendMail({from,to:{address:job.recipient},replyTo:job.payload.audience==='admin' ? job.payload.email : env.SMTP_REPLY_TO || env.SMTP_FROM,
        ...confirmation(job.kind,job.payload),messageId:`<${job.id}@${env.SMTP_FROM.split('@')[1]}>`});
      if (!result.accepted?.length || result.rejected?.length) throw Object.assign(new Error('SMTP recipient was not accepted.'),{code:'ERECIPIENT'});
    },
    close:()=>smtp.close?.(),
  };
}
