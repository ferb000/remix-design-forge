import {test} from 'node:test';
import assert from 'node:assert/strict';
import {confirmation,createMailer,smtpOptions} from '../src/mail.js';

const env={SMTP_ENABLED:'true',SMTP_HOST:'smtp.example.com',SMTP_PORT:'587',SMTP_USER:'test-user',SMTP_PASS:'test-secret',SMTP_FROM:'studio@example.com',SMTP_REPLY_TO:'help@example.com'};
test('SMTP uses STARTTLS on 587 and implicit TLS on 465 without disabling certificate checks',()=>{
  const options=smtpOptions(env);
  assert.equal(options.secure,false);assert.equal(options.requireTLS,true);
  assert.equal(options.tls.minVersion,'TLSv1.2');assert.equal(options.tls.rejectUnauthorized,undefined);
  assert.equal(smtpOptions({...env,SMTP_PORT:'465'}).secure,true);
  assert.throws(()=>smtpOptions({...env,SMTP_FROM:'invalid'}));
  assert.throws(()=>smtpOptions({...env,SMTP_PASS:''}));
  assert.throws(()=>smtpOptions({...env,SMTP_PORT:'abc'}));
  assert.throws(()=>smtpOptions({...env,SMTP_SECURE:'yes'}));
  assert.equal(createMailer({}).enabled,false);
});
test('confirmation templates escape user content and include booking details and reference',()=>{
  const data={id:'booking-1',name:'<script>test</script>',serviceName:'Film & CGI',date:'2026-10-20',time:'14:00 CET'};
  const booking=confirmation('bookings',data);
  assert.match(booking.text,/2026-10-20/);assert.match(booking.text,/14:00 CET/);assert.match(booking.text,/booking-1/);
  assert.ok(!booking.html.includes('<script>'));assert.match(booking.html,/&lt;script&gt;/);assert.match(booking.html,/Film &amp; CGI/);
  const inquiry=confirmation('inquiries',{...data,message:'Do not reflect this arbitrary message'});
  assert.match(inquiry.subject,/inquiry/);assert.ok(!inquiry.text.includes('Do not reflect'));
});
test('mailer addresses only the submitter and uses a stable message ID',async()=>{
  const sent=[];
  const mailer=createMailer(env,{async sendMail(message){sent.push(message);return {accepted:['visitor@example.com'],rejected:[]};},async verify(){return true;},close(){}});
  await mailer.verify();
  await mailer.send({id:'confirmation-booking-1',kind:'bookings',recipient:'visitor@example.com',payload:{id:'booking-1',name:'Visitor',serviceName:'CGI',date:'2026-10-20',time:'10:00 CET'}});
  assert.deepEqual(sent[0].to,{address:'visitor@example.com'});assert.equal(sent[0].from.address,'studio@example.com');
  assert.equal(sent[0].replyTo,'help@example.com');assert.equal(sent[0].messageId,'<confirmation-booking-1@example.com>');
  assert.equal(sent[0].bcc,undefined);
});
test('SMTP recipient rejection is treated as a delivery failure',async()=>{
  const mailer=createMailer(env,{async sendMail(){return {accepted:[],rejected:['visitor@example.com']};}});
  await assert.rejects(mailer.send({id:'confirmation-inquiry-1',kind:'inquiries',recipient:'visitor@example.com',payload:{id:'inquiry-1',name:'Visitor'}}),error=>error.code==='ERECIPIENT');
});

test('administrator notification includes escaped submission details and replies to the visitor',async()=>{
  const sent=[];
  const mailer=createMailer(env,{async sendMail(message){sent.push(message);return {accepted:['studio@example.com'],rejected:[]};}});
  await mailer.send({id:'notification-inquiry-1',kind:'inquiries',recipient:'studio@example.com',payload:{audience:'admin',id:'inquiry-1',name:'<Visitor>',email:'visitor@example.com',message:'Please render <script>my home</script>'}});
  assert.equal(sent[0].replyTo,'visitor@example.com');
  assert.match(sent[0].subject,/New Design Forge inquiry/);
  assert.match(sent[0].text,/Please render/);
  assert.ok(!sent[0].html.includes('<script>'));
  assert.match(sent[0].html,/&lt;script&gt;/);
});
