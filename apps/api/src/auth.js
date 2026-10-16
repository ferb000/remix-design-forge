import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export const tokenHash = (token) =>
  createHash("sha256").update(token).digest("hex");
export const publicUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  lastLogin: row.last_login,
});

export async function seedAdmin(pool) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in apps/api/.env for database setup.",
    );
  await pool.query(
    "INSERT INTO admin_users(id,email,name,password_hash) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING",
    [
      "usr-admin-01",
      process.env.ADMIN_EMAIL.trim().toLowerCase(),
      process.env.ADMIN_NAME || "Studio Director",
      hashPassword(process.env.ADMIN_PASSWORD),
    ],
  );
}
