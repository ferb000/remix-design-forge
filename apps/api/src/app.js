import express from "express";
import multer from "multer";
import { randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tokenHash, publicUser, verifyPassword } from "./auth.js";
import { ApiError, validate } from "./validation.js";
import { availability, validateSlot } from "./scheduling.js";
import { createStorage } from './storage.js';
import { pipeline } from 'node:stream/promises';
import { saveSubmission } from './mail-queue.js';

const root = fileURLToPath(new URL("../", import.meta.url));
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });
const types = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export function createApp({
  pool,
  now = Date.now,
  uploadsDir = path.join(root, "uploads"),
  storage,
  mailEnabled = false,
  trustProxy = process.env.TRUST_PROXY_HOPS === '1' ? 1 : 'loopback',
  production = process.env.NODE_ENV === 'production',
  publicUrl = process.env.PUBLIC_API_URL || "http://localhost:3002",
  origins = (
    process.env.CORS_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000"
  ).split(",").map(origin => origin.trim().replace(/\/$/,'')),
}) {
  const app = express();
  app.set('trust proxy', trustProxy);
  const files = storage || createStorage({uploadsDir,publicUrl});
  const cookieOptions = { httpOnly: true, secure: production, sameSite: 'strict', path: '/api', maxAge: 8*60*60*1000 };
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    const origin = req.headers.origin;
    if (origin && !origins.includes(origin))
      return next(new ApiError(403, "Origin is not allowed."));
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.vary("Origin");
    }
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: "1mb" }));
  app.use(
    "/uploads",
    express.static(uploadsDir, {
      dotfiles: "deny",
      setHeaders: (res) =>
        res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox"),
    }),
  );
  app.use(
    "/assets",
    express.static(
      fileURLToPath(new URL("../../web/src/assets/images/", import.meta.url)),
      { dotfiles: "deny" },
    ),
  );
  // These images are public portfolio content; the S3 bucket itself stays private.
  app.get('/api/media/:name',asyncRoute(async(req,res)=>{
    if (!files.read) throw new ApiError(404,'Image not found.');
    let object;
    try { object=await files.read(req.params.name); }
    catch(error) {
      if(error.name==='NoSuchKey' || error.$metadata?.httpStatusCode===404) throw new ApiError(404,'Image not found.');
      throw error;
    }
    res.setHeader('Content-Type',object.ContentType || 'application/octet-stream');
    res.setHeader('Content-Security-Policy',"default-src 'none'; sandbox");
    res.setHeader('Cache-Control','public, max-age=31536000, immutable');
    if(object.ContentLength !== undefined) res.setHeader('Content-Length',String(object.ContentLength));
    if(object.ETag) res.setHeader('ETag',object.ETag);
    const close = () => object.Body.destroy();
    res.once('close',close);
    try { await pipeline(object.Body,res); } finally { res.off('close',close); }
  }));
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024,
      files: 1,
      fields: 2,
      fieldSize: 1024 * 1024,
    },
    fileFilter: (req, file, cb) =>
      cb(
        types[file.mimetype]
          ? null
          : new ApiError(400, "Upload a JPG, PNG, WebP, GIF, or SVG image."),
        Boolean(types[file.mimetype]),
      ),
  });
  const requireAuth = asyncRoute(async (req, res, next) => {
    res.setHeader('Cache-Control','no-store');
    const bearer = req.headers.authorization?.match(
      /^Bearer ([a-f0-9]{64})$/,
    )?.[1];
    const cookie = req.headers.cookie?.match(/(?:^|;\s*)studio_session=([a-f0-9]{64})(?:;|$)/)?.[1];
    const token = bearer || cookie;
    if (cookie && !bearer && !['GET','HEAD','OPTIONS'].includes(req.method) && !origins.includes(req.headers.origin)) throw new ApiError(403,'A trusted site origin is required.');
    if (!token) throw new ApiError(401, "Please sign in again.");
    const result = await pool.query(
      "SELECT u.* FROM sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()",
      [tokenHash(token)],
    );
    if (!result.rowCount)
      throw new ApiError(401, "Your session expired. Please sign in again.");
    req.user = result.rows[0];
    if (!['super_admin','studio_director','lead_artist'].includes(req.user.role)) throw new ApiError(403,'Administrator access is required.');
    req.sessionHash = tokenHash(token);
    next();
  });
  const attempts = new Map();
  app.post(
    "/api/auth/login",
    asyncRoute(async (req, res) => {
      const key = req.ip;
      const now = Date.now();
      for (const [address, attempt] of attempts)
        if (attempt.until < now) attempts.delete(address);
      const attempt = attempts.get(key) || {
        count: 0,
        until: now + 15 * 60 * 1000,
      };
      if (attempt.count >= 10)
        throw new ApiError(429, "Too many login attempts. Try again later.");
      attempt.count++;
      attempts.set(key, attempt);
      const { email, password } = req.body || {};
      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        password.length > 1024
      )
        throw new ApiError(400, "Email and password are required.");
      const result = await pool.query(
        "SELECT * FROM admin_users WHERE email=$1",
        [email.trim().toLowerCase()],
      );
      const user = result.rows[0];
      if (!user || !verifyPassword(password, user.password_hash))
        throw new ApiError(401, "Invalid email or password.");
      attempts.delete(key);
      const token = randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
      await pool.query("DELETE FROM sessions WHERE expires_at<=now()");
      await pool.query(
        "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)",
        [tokenHash(token), user.id, new Date(expiresAt)],
      );
      user.last_login = new Date().toISOString();
      await pool.query("UPDATE admin_users SET last_login=$1 WHERE id=$2", [
        user.last_login,
        user.id,
      ]);
      res.cookie('studio_session', token, cookieOptions);
      res.setHeader('Cache-Control','no-store');
      res.json({ success: true, ...(production ? {} : {token}), user: publicUser(user), expiresAt });
    }),
  );
  app.get("/api/auth/session", requireAuth, (req, res) =>
    ok(res, publicUser(req.user)),
  );
  app.post(
    "/api/auth/logout",
    requireAuth,
    asyncRoute(async (req, res) => {
      await pool.query("DELETE FROM sessions WHERE token_hash=$1", [
        req.sessionHash,
      ]);
      res.clearCookie('studio_session', { ...cookieOptions, maxAge: undefined });
      ok(res, true);
    }),
  );
  app.get(
    "/api/health",
    asyncRoute(async (req, res) => {
      await pool.query("SELECT 1");
      ok(res, { status: "ok" });
    }),
  );

  function present(record) {
    const result = { ...record };
    for (const field of ["image", "logoUrl"])
      if (result[field]?.startsWith("/"))
        result[field] = publicUrl.replace(/\/$/, "") + result[field];
    return result;
  }
  async function storeFile(file) {
    if (!file) return undefined;
    // Check signatures for raster images rather than trusting browser MIME alone.
    const b = file.buffer;
    const valid =
      file.mimetype === "image/png"
        ? b
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : file.mimetype === "image/jpeg"
          ? b[0] === 255 && b[1] === 216 && b[2] === 255
          : file.mimetype === "image/webp"
            ? b.toString("ascii", 0, 4) === "RIFF" &&
              b.toString("ascii", 8, 12) === "WEBP"
            : file.mimetype === "image/gif"
              ? /^GIF8[79]a/.test(b.toString("ascii", 0, 6))
              : /<svg[\s>]/i.test(b.toString("utf8")) &&
                !/<script|<foreignObject|<!ENTITY|\bon\w+\s*=|(?:href|src)\s*=\s*["']\s*(?:https?:|javascript:|data:)/i.test(
                  b.toString("utf8"),
                );
    if (!valid) throw new ApiError(400, "Invalid or unsafe image file.");
    const filename = `${randomUUID()}.${types[file.mimetype]}`;
    return files.put(filename, b, file.mimetype);
  }
  function input(req, field) {
    if (req.is("multipart/form-data")) {
      try {
        return JSON.parse(req.body[field]);
      } catch {
        throw new ApiError(400, `Invalid ${field} JSON.`);
      }
    }
    return req.body;
  }
  for (const table of ["projects", "clients"]) {
    app.get(
      `/api/${table}`,
      asyncRoute(async (req, res) => {
        const result = await pool.query(
          `SELECT data FROM ${table} ORDER BY created_at DESC,id`,
        );
        ok(
          res,
          result.rows.map((row) => present(row.data)),
        );
      }),
    );
    app.get(
      `/api/${table}/:id`,
      asyncRoute(async (req, res) => {
        const result = await pool.query(
          `SELECT data FROM ${table} WHERE id=$1`,
          [req.params.id],
        );
        if (!result.rowCount) throw new ApiError(404, "Record not found.");
        ok(res, present(result.rows[0].data));
      }),
    );
    const field = table === "projects" ? "project" : "client";
    const fileField = table === "projects" ? "image" : "logo";
    const media = table === "projects" ? "image" : "logoUrl";
    app.post(
      `/api/${table}`,
      requireAuth,
      upload.single(fileField),
      asyncRoute(async (req, res) => {
        const raw = input(req, field);
        const savedFile = await storeFile(req.file);
        try {
          const data = validate(table, {
            ...raw,
            ...(savedFile ? { [media]: savedFile } : {}),
          });
          data.id = table.slice(0, -1) + "-" + randomUUID();
          data.createdAt = new Date().toISOString();
          await pool.query(`INSERT INTO ${table}(id,data) VALUES($1,$2)`, [
            data.id,
            data,
          ]);
          ok(res, present(data), 201);
        } catch (error) {
          if (savedFile) await files.remove(savedFile).catch(() => {});
          throw error;
        }
      }),
    );
    app.delete(
      `/api/${table}/:id`,
      requireAuth,
      asyncRoute(async (req, res) => {
        const result = await pool.query(
          `DELETE FROM ${table} WHERE id=$1 RETURNING id`,
          [req.params.id],
        );
        if (!result.rowCount) throw new ApiError(404, "Record not found.");
        ok(res, true);
      }),
    );
  }
  app.put(
    "/api/projects/:id",
    requireAuth,
    asyncRoute(async (req, res) => {
      const updates = validate("projects", req.body, true);
      const result = await pool.query(
        "UPDATE projects SET data=data || $1::jsonb WHERE id=$2 RETURNING data",
        [JSON.stringify(updates), req.params.id],
      );
      if (!result.rowCount) throw new ApiError(404, "Project not found.");
      ok(res, present(result.rows[0].data));
    }),
  );
  app.post(
    "/api/upload",
    requireAuth,
    upload.single("file"),
    asyncRoute(async (req, res) => {
      if (!req.file) throw new ApiError(400, "A file is required.");
      const stored = await storeFile(req.file);
      ok(res, { url: stored.startsWith('/') ? publicUrl + stored : stored }, 201);
    }),
  );
  app.get(
    "/api/bookings/availability",
    asyncRoute(async (req, res) => {
      res.setHeader("Cache-Control", "no-store");
      ok(res, await availability(pool, now()));
    }),
  );
  for (const table of ["inquiries", "bookings"]) {
    app.post(
      `/api/${table}`,
      asyncRoute(async (req, res) => {
        const data = validate(table, req.body);
        data.id = table.slice(0, -1) + "-" + randomUUID();
        data.submittedAt = new Date().toISOString();
        data.status = table === "inquiries" ? "new" : "confirmed";
        if (table === "bookings") {
          const slot = validateSlot(data.date, data.time, now());
          data.startsAt = slot.startsAt;
          data.endsAt = slot.endsAt;
        }
        try {
          await saveSubmission(pool,table,data,mailEnabled);
        } catch (error) {
            if (error.code === "23P01")
              throw new ApiError(
                409,
                "This consultation slot has just been booked. Please choose another time.",
              );
            throw error;
        }
        ok(
          res,
          table === "inquiries"
            ? { received: true, id: data.id, emailStatus:mailEnabled?'queued':'disabled' }
            : { booked: true, reservationId: data.id, emailStatus:mailEnabled?'queued':'disabled' },
          201,
        );
      }),
    );
    app.get(
      `/api/${table}`,
      requireAuth,
      asyncRoute(async (req, res) => {
        const result = await pool.query(
          `SELECT data FROM ${table} ORDER BY created_at DESC,id`,
        );
        ok(
          res,
          result.rows.map((row) => row.data),
        );
      }),
    );
  }
  app.patch(
    "/api/inquiries/:id",
    requireAuth,
    asyncRoute(async (req, res) => {
      const status = req.body?.status;
      if (!["new", "reviewed", "archived"].includes(status))
        throw new ApiError(400, "Invalid inquiry status.");
      const result = await pool.query(
        "UPDATE inquiries SET data=data || $1::jsonb WHERE id=$2 RETURNING data",
        [JSON.stringify({ status }), req.params.id],
      );
      if (!result.rowCount) throw new ApiError(404, "Inquiry not found.");
      ok(res, result.rows[0].data);
    }),
  );
  app.use((req, res, next) => next(new ApiError(404, "Endpoint not found.")));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status =
      error instanceof multer.MulterError
        ? error.code === "LIMIT_FILE_SIZE"
          ? 413
          : 400
        : error.status || 500;
    if (status >= 500)
      console.error("API request failed:", error.code || error.message);
    res
      .status(status)
      .json({
        success: false,
        data: null,
        message:
          status >= 500
            ? "The server could not complete this request."
            : error.message,
      });
  });
  return app;
}
