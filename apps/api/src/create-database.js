import pg from "pg";
if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL in apps/api/.env first.");
const target = new URL(process.env.DATABASE_URL);
const name = target.pathname.slice(1);
if (!["design_forge", "design_forge_test"].includes(name))
  throw new Error(
    "This setup helper only creates design_forge or design_forge_test.",
  );
target.pathname = "/postgres";
const client = new pg.Client({
  connectionString: target.toString(),
  connectionTimeoutMillis: 5000,
});
await client.connect();
try {
  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname=$1",
    [name],
  );
  if (!existing.rowCount) await client.query(`CREATE DATABASE "${name}"`);
  console.log(`Database ${name} is ready.`);
} finally {
  await client.end();
}
