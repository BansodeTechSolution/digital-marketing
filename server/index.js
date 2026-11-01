import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import { createHmac, timingSafeEqual } from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 4000);
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: '20kb' }));

let poolPromise;
const mockMode = process.env.USE_MOCK_DATA === 'true';
const adminUsername = process.env.ADMIN_USERNAME || (mockMode ? 'organizer' : '');
const adminPassword = process.env.ADMIN_PASSWORD || (mockMode ? 'demo-admin-2026' : '');
const sessionSecret = process.env.SESSION_SECRET || (mockMode ? 'mock-only-session-secret-change-before-deploy' : '');
const sessionCookie = 'organizer_session';
const sessionMaxAgeSeconds = 8 * 60 * 60;
const failedLogins = new Map();
const mockRegistrations = [
  { id: 1, name: 'Aarav Mehta', business: 'Mehta Family Grocers', topic: 'WhatsApp Business', createdAt: new Date().toISOString() },
  { id: 2, name: 'Sana Khan', business: 'Sana’s Home Bakery', topic: 'Social media content', createdAt: new Date().toISOString() },
];
let nextMockId = mockRegistrations.length + 1;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect({
      server: process.env.DB_SERVER || 'localhost',
      port: Number(process.env.DB_PORT || 1433),
      database: process.env.DB_NAME || 'DigitalMarketingTraining',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      },
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    }).catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', storage: mockMode ? 'mock' : 'sql-server' }));

function constantTimeMatch(value, expected) {
  if (typeof value !== 'string' || typeof expected !== 'string') return false;
  const supplied = Buffer.from(value || '');
  const actual = Buffer.from(expected || '');
  return actual.length > 0 && supplied.length === actual.length && timingSafeEqual(supplied, actual);
}

function signSession(payload) {
  return createHmac('sha256', sessionSecret).update(payload).digest('base64url');
}

function readSession(req) {
  if (!sessionSecret) return null;
  const cookie = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie}=`));
  if (!cookie) return null;
  const token = cookie.slice(sessionCookie.length + 1);
  const separator = token.lastIndexOf('.');
  if (separator < 1) return null;
  const payload = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  if (!constantTimeMatch(suppliedSignature, signSession(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function requireOrganizer(req, res, next) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Please sign in to view registrations.' });
  req.organizer = session.username;
  return next();
}

app.post('/api/auth/login', (req, res) => {
  if (!adminUsername || !adminPassword || !sessionSecret) {
    return res.status(503).json({ error: 'Organizer login is not configured on the server.' });
  }
  const now = Date.now();
  const ip = req.ip;
  const attempts = failedLogins.get(ip);
  for (const [address, entry] of failedLogins) {
    if (entry.resetAt <= now) failedLogins.delete(address);
  }
  if (attempts && attempts.resetAt > now && attempts.count >= 10) {
    return res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
  }

  const { username, password } = req.body || {};
  const valid = constantTimeMatch(username, adminUsername) && constantTimeMatch(password, adminPassword);
  if (!valid) {
    failedLogins.set(ip, attempts && attempts.resetAt > now
      ? { count: attempts.count + 1, resetAt: attempts.resetAt }
      : { count: 1, resetAt: now + 15 * 60 * 1000 });
    return res.status(401).json({ error: 'Username or password is incorrect.' });
  }

  failedLogins.delete(ip);
  const payload = Buffer.from(JSON.stringify({ username: adminUsername, expiresAt: now + sessionMaxAgeSeconds * 1000 })).toString('base64url');
  const token = `${payload}.${signSession(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${sessionCookie}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${sessionMaxAgeSeconds}${secure}`);
  return res.json({ authenticated: true, username: adminUsername });
});

app.get('/api/auth/session', (req, res) => {
  const session = readSession(req);
  if (!session) return res.status(401).json({ authenticated: false });
  return res.json({ authenticated: true, username: session.username });
});

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', `${sessionCookie}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return res.json({ authenticated: false });
});

app.get('/api/admin/registrations', requireOrganizer, async (_req, res) => {

  if (mockMode) return res.json({ registrations: mockRegistrations, storage: 'mock' });

  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT Id AS id, Name AS name, Business AS business,
             LearningTopic AS topic, CreatedAt AS createdAt
      FROM dbo.TrainingRegistrations
      ORDER BY CreatedAt DESC
    `);
    return res.json({ registrations: result.recordset, storage: 'sql-server' });
  } catch (error) {
    console.error('Registration list failed:', error.message);
    return res.status(503).json({ error: 'We could not load registrations right now.' });
  }
});

app.post('/api/registrations', async (req, res) => {
  const { name, business, topic } = req.body || {};
  if (![name, business, topic].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Name, business, and learning topic are required.' });
  }
  if (name.length > 120 || business.length > 160 || topic.length > 120) {
    return res.status(400).json({ error: 'One or more fields are too long.' });
  }

  if (mockMode) {
    const registration = {
      id: nextMockId++, name: name.trim(), business: business.trim(), topic: topic.trim(),
      createdAt: new Date().toISOString(),
    };
    mockRegistrations.unshift(registration);
    return res.status(201).json({ message: 'Your interest has been saved in temporary demo data.', registration });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('name', sql.NVarChar(120), name.trim())
      .input('business', sql.NVarChar(160), business.trim())
      .input('topic', sql.NVarChar(120), topic.trim())
      .query(`INSERT INTO dbo.TrainingRegistrations (Name, Business, LearningTopic)
              OUTPUT INSERTED.Id, INSERTED.CreatedAt
              VALUES (@name, @business, @topic)`);
    return res.status(201).json({ message: 'Your interest has been saved.', registration: result.recordset[0] });
  } catch (error) {
    console.error('Registration save failed:', error.message);
    return res.status(503).json({ error: 'We could not save your request right now. Please try again shortly.' });
  }
});

app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
