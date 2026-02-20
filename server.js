'use strict';
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { generateImage, generateSVG, THEMES } = require('./generate');

const app = express();
const PORT = process.env.PORT || 3710;

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const KEYS_FILE = path.join(DATA_DIR, 'api-keys.json');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// In-memory store helpers
function readJSON(file, def = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Rate limiting (in-memory, per IP)
const ipLimits = new Map();
const FREE_PER_HOUR = 50;

function rateCheck(ip) {
  const now = Date.now();
  const window = 3600_000;
  let rec = ipLimits.get(ip) || { count: 0, reset: now + window };
  if (now > rec.reset) { rec.count = 0; rec.reset = now + window; }
  rec.count++;
  ipLimits.set(ip, rec);
  return { ok: rec.count <= FREE_PER_HOUR, remaining: Math.max(0, FREE_PER_HOUR - rec.count), resetIn: Math.ceil((rec.reset - now) / 1000) };
}
setInterval(() => { const now = Date.now(); for (const [k, v] of ipLimits) if (now > v.reset) ipLimits.delete(k); }, 3_600_000);

// API key validation
function validateApiKey(key) {
  if (!key) return false;
  const keys = readJSON(KEYS_FILE, {});
  return !!keys[key];
}

// Stats tracking
function trackUsage(type) {
  const stats = readJSON(STATS_FILE, { total: 0, byType: {} });
  stats.total++;
  stats.byType[type] = (stats.byType[type] || 0) + 1;
  stats.lastUsed = new Date().toISOString();
  writeJSON(STATS_FILE, stats);
}

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Health ──────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  const stats = readJSON(STATS_FILE, { total: 0 });
  const waitlist = readJSON(WAITLIST_FILE, []);
  const keys = readJSON(KEYS_FILE, {});
  res.json({
    status: 'ok',
    version: '1.0.0',
    themes: Object.keys(THEMES),
    total_images: stats.total,
    waitlist: waitlist.length,
    paid_users: Object.keys(keys).length,
  });
});

// ── OG Image generation ─────────────────────────────────────────────────────

function parseOpts(source) {
  return {
    title: source.title || 'Open Graph Image',
    description: source.desc || source.description || '',
    theme: source.theme || 'dark',
    site: source.site || source.domain || 'shiplab.xyz',
  };
}

function handleOG(req, res) {
  const ip = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '') || req.query.key;
  const isPaid = validateApiKey(apiKey);

  if (!isPaid) {
    const rl = rateCheck(ip);
    if (!rl.ok) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Free tier: 50 requests/hour. Get unlimited at snapog.shiplab.xyz ($49 one-time)',
        retry_after: rl.resetIn,
      });
    }
    res.setHeader('X-RateLimit-Remaining', rl.remaining);
    res.setHeader('X-RateLimit-Reset', rl.resetIn);
  }

  try {
    const opts = parseOpts(req.method === 'POST' ? req.body : req.query);
    const png = generateImage(opts);
    trackUsage(isPaid ? 'paid' : 'free');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.setHeader('X-Tier', isPaid ? 'paid' : 'free');
    res.end(png);
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({ error: 'Failed to generate image', details: err.message });
  }
}

app.get('/og', handleOG);
app.post('/og', handleOG);

app.get('/svg', (req, res) => {
  try {
    const svg = generateSVG(parseOpts(req.query));
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(svg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Telegram alert helper ─────────────────────────────────────────────────────
const TG_TOKEN = '8372674797:AAFJLcO2SnT0qVrA3Gi4MvQ4KbNDfH6a-74';
const TG_CHAT  = '8510001190';
async function tgAlert(text) {
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'Markdown' }),
    });
  } catch(e) { console.error('TG alert failed:', e.message); }
}

// ── Waitlist ─────────────────────────────────────────────────────────────────

app.post('/waitlist', async (req, res) => {
  const { email, name, paypal } = req.body || {};
  if (!email?.includes('@')) return res.status(400).json({ error: 'Valid email required' });

  const list = readJSON(WAITLIST_FILE, []);
  if (list.find(w => w.email === email)) return res.json({ status: 'already_subscribed', position: list.findIndex(w => w.email === email) + 1 });

  const entry = { email, name: name || '', paypal: paypal || '', date: new Date().toISOString(), id: crypto.randomUUID() };
  list.push(entry);
  writeJSON(WAITLIST_FILE, list);
  console.log(`📧 Waitlist signup: ${email} (#${list.length})`);

  // Notify via Telegram
  await tgAlert(`🔔 *SnapOG Waitlist Signup #${list.length}*\n📧 ${email}\n👤 ${name || '(no name)'}\n💰 PayPal: ${paypal || '(not provided)'}\n\nIssue key: POST /admin/issue-key\nAdmin secret in server logs`);

  res.json({ status: 'ok', position: list.length, message: 'Check your email — we\'ll send your API key shortly.' });
});

// ── Purchase Request ─────────────────────────────────────────────────────────

app.post('/purchase', async (req, res) => {
  const { email, paymentMethod, website } = req.body || {};
  if (!email?.includes('@')) return res.status(400).json({ error: 'Valid email required' });
  if (!paymentMethod) return res.status(400).json({ error: 'Payment method required' });

  const purchases = readJSON('data/purchases.json', []);
  const entry = { 
    email, 
    paymentMethod, 
    website: website || '', 
    date: new Date().toISOString(), 
    id: crypto.randomUUID(),
    status: 'pending'
  };
  purchases.push(entry);
  writeJSON('data/purchases.json', purchases);
  console.log(`💰 Purchase request: ${email} via ${paymentMethod}`);

  // Notify via Telegram
  await tgAlert(`💸 *SnapOG Purchase Request*\n📧 ${email}\n💳 ${paymentMethod}\n🌐 ${website || 'N/A'}\n\nSend payment instructions to customer`);

  res.json({ status: 'ok' });
});

app.get('/waitlist/count', (req, res) => {
  const list = readJSON(WAITLIST_FILE, []);
  res.json({ count: list.length });
});

// ── Payment webhooks ─────────────────────────────────────────────────────────
// Gumroad webhook — fires on sale
app.post('/webhook/gumroad', express.raw({ type: '*/*' }), (req, res) => {
  // Gumroad sends form-encoded body
  const body = req.body.toString();
  const params = new URLSearchParams(body);
  const email = params.get('email');
  const productPermalink = params.get('product_permalink');
  const sale_id = params.get('sale_id');

  if (!email) return res.status(400).json({ error: 'No email in webhook' });

  console.log(`💰 Gumroad sale: ${email} | ${productPermalink} | ${sale_id}`);

  // Issue API key
  const keys = readJSON(KEYS_FILE, {});
  const newKey = 'sog_' + crypto.randomBytes(20).toString('hex');
  keys[newKey] = { email, created: new Date().toISOString(), source: 'gumroad', sale_id };
  writeJSON(KEYS_FILE, keys);

  console.log(`🔑 API key issued: ${newKey} → ${email}`);
  res.json({ status: 'ok', key: newKey });
});

// LemonSqueezy webhook — fires on order_created
app.post('/webhook/lemonsqueezy', express.raw({ type: 'application/json' }), (req, res) => {
  const SIGNING_SECRET = process.env.LS_WEBHOOK_SECRET || '';
  const sig = req.headers['x-signature'];

  if (SIGNING_SECRET && sig) {
    const hmac = crypto.createHmac('sha256', SIGNING_SECRET).update(req.body).digest('hex');
    if (hmac !== sig) return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload = JSON.parse(req.body.toString());
  const event = payload.meta?.event_name;
  if (event !== 'order_created') return res.json({ status: 'ignored', event });

  const email = payload.data?.attributes?.user_email;
  const orderId = payload.data?.id;
  if (!email) return res.status(400).json({ error: 'No email in payload' });

  console.log(`💰 LemonSqueezy order: ${email} | order #${orderId}`);

  const keys = readJSON(KEYS_FILE, {});
  const newKey = 'sog_' + crypto.randomBytes(20).toString('hex');
  keys[newKey] = { email, created: new Date().toISOString(), source: 'lemonsqueezy', orderId };
  writeJSON(KEYS_FILE, keys);

  console.log(`🔑 API key issued: ${newKey} → ${email}`);
  res.json({ status: 'ok' });
});

// ── Admin (internal use) ──────────────────────────────────────────────────────
const ADMIN_SECRET = process.env.ADMIN_SECRET || crypto.randomBytes(16).toString('hex');
console.log(`🔐 Admin secret: ${ADMIN_SECRET}`);

app.get('/admin/stats', (req, res) => {
  if (req.headers['x-admin'] !== ADMIN_SECRET) return res.status(403).json({ error: 'Forbidden' });
  const keys = readJSON(KEYS_FILE, {});
  const list = readJSON(WAITLIST_FILE, []);
  const stats = readJSON(STATS_FILE, {});
  res.json({ keys: Object.keys(keys).length, waitlist: list.length, stats, keyDetails: keys });
});

app.post('/admin/issue-key', (req, res) => {
  if (req.headers['x-admin'] !== ADMIN_SECRET) return res.status(403).json({ error: 'Forbidden' });
  const { email, note } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const keys = readJSON(KEYS_FILE, {});
  const newKey = 'sog_' + crypto.randomBytes(20).toString('hex');
  keys[newKey] = { email, created: new Date().toISOString(), source: 'manual', note: note || '' };
  writeJSON(KEYS_FILE, keys);
  res.json({ key: newKey, email });
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`SnapOG API running on :${PORT}`);
  console.log(`Free: http://localhost:${PORT}/og?title=Hello&theme=dark`);
});
