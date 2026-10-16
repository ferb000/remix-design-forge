import { createMailer } from './mail.js';
const mailer=createMailer();
if(!mailer.enabled) throw new Error('Enable SMTP_ENABLED=true before verifying SMTP.');
try {
  await mailer.verify();
  console.log('SMTP connection and authentication verified. No email was sent.');
} catch(error) {
  console.error('SMTP verification failed:',error.code || 'SMTP_ERROR');
  process.exitCode=1;
} finally { mailer.close(); }
