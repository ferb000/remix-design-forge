import pg from "pg";
import { readFile } from "node:fs/promises";
import { readFileSync } from 'node:fs';
import { interval } from "./scheduling.js";

export function databaseConnection(connectionString = process.env.DATABASE_URL, passwordFile = process.env.DATABASE_PASSWORD_FILE) {
  if (!connectionString)
    throw new Error(
      "Set DATABASE_URL in apps/api/.env before starting the API.",
    );
  if (passwordFile) {
    const password = readFileSync(passwordFile,'utf8').trim();
    if (!password) throw new Error('Database password file is empty.');
    const url = new URL(connectionString);
    url.password = encodeURIComponent(password);
    return url.toString();
  }
  return connectionString;
}

export function createPool(connectionString = process.env.DATABASE_URL) {
  return new pg.Pool({ connectionString: databaseConnection(connectionString), connectionTimeoutMillis: 5000 });
}

export async function migrate(pool) {
  const sql = await readFile(
    new URL("../sql/schema.sql", import.meta.url),
    "utf8",
  );
  await pool.query(sql);
  const legacy = await pool.query(
    "SELECT id,data FROM bookings WHERE reserved_range IS NULL",
  );
  for (const row of legacy.rows) {
    // Preserve legacy records and include them in availability, even outside the new booking horizon.
    const slot = interval(row.data.date, row.data.time);
    await pool.query(
      "UPDATE bookings SET reserved_range=tstzrange($1,$2,'[)'),data=data || $3::jsonb WHERE id=$4 AND reserved_range IS NULL",
      [slot.startsAt, slot.endsAt, JSON.stringify(slot), row.id],
    );
  }
  await pool.query(
    "ALTER TABLE bookings ALTER COLUMN reserved_range SET NOT NULL",
  );
}
