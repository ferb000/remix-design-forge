import { createPool, migrate } from "./db.js";
import { seedAdmin } from "./auth.js";
import { readFile } from "node:fs/promises";

export async function setup(pool) {
  await migrate(pool);
  await seedAdmin(pool);
  const seed = JSON.parse(
    await readFile(new URL("../data/seed.json", import.meta.url), "utf8"),
  );
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Serialize setup so concurrent startups cannot seed twice.
    await client.query("SELECT pg_advisory_xact_lock(73451290)");
    const result = await client.query(
      "SELECT name FROM seed_history WHERE name='existing-website-v1'",
    );
    if (!result.rowCount) {
      for (const table of ["projects", "clients"]) {
        for (const [index, record] of seed[table].entries()) {
          await client.query(
            `INSERT INTO ${table}(id,data,created_at) VALUES($1,$2,now()-($3::int * interval '1 millisecond')) ON CONFLICT(id) DO NOTHING`,
            [record.id, record, index],
          );
        }
      }
      await client.query(
        "INSERT INTO seed_history(name) VALUES('existing-website-v1')",
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith("setup.js")) {
  const pool = createPool();
  try {
    await setup(pool);
    console.log(
      "Database ready: existing website content and administrator initialized.",
    );
  } finally {
    await pool.end();
  }
}
