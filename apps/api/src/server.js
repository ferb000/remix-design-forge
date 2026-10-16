import { createPool } from "./db.js";
import { setup } from "./setup.js";
import { createApp } from "./app.js";
import { validateProductionConfig } from './config.js';
import { createMailer } from './mail.js';
import { startMailWorker } from './mail-queue.js';

validateProductionConfig();
const mailer=createMailer();
const pool = createPool();
await setup(pool);
const app = createApp({ pool, mailEnabled:mailer.enabled });
const mailWorker=startMailWorker(pool,mailer);
const server = app.listen(Number(process.env.PORT || 3002), process.env.HOST || "127.0.0.1", () =>
  console.log(
    `Design Forge API: ${process.env.PUBLIC_API_URL || "http://localhost:3002"}`,
  ),
);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    const stopping=mailWorker.stop();
    server.close(async () => {
      await stopping;
      await pool.end();
      process.exit(0);
    });
  });
}
