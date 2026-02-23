'use strict';
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { generateImage, generateSVG, THEMES } = require('./generate');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3710;

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const KEYS_FILE = path.join(DATA_DIR, 'api-keys.json');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

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

// Detailed analytics tracking
function logAnalytics(data) {
  const analytics = readJSON(ANALYTICS_FILE, { requests: [], summary: {} });
  
  // Add request
  analytics.requests.push({
    ts: data.ts,
    title: data.title,
    theme: data.theme,
    site: data.site,
    referrer: data.referrer,
    ua: data.ua,
    ip: data.ip,
    paid: data.paid
  });
  
  // Keep only last 1000 requests to prevent file bloat
  if (analytics.requests.length > 1000) {
    analytics.requests = analytics.requests.slice(-1000);
  }
  
  // Update summary stats
  const sum = analytics.summary;
  sum.totalRequests = (sum.totalRequests || 0) + 1;
  sum.paidRequests = (sum.paidRequests || 0) + (data.paid ? 1 : 0);
  sum.freeRequests = (sum.freeRequests || 0) + (data.paid ? 0 : 1);
  sum.lastRequest = data.ts;
  
  // Track unique IPs
  sum.uniqueIPs = sum.uniqueIPs || {};
  sum.uniqueIPs[data.ip] = (sum.uniqueIPs[data.ip] || 0) + 1;
  
  // Track themes
  sum.themeUsage = sum.themeUsage || {};
  sum.themeUsage[data.theme] = (sum.themeUsage[data.theme] || 0) + 1;
  
  // Track referrers
  sum.referrers = sum.referrers || {};
  const refKey = data.referrer === 'direct' ? 'direct' : new URL(data.referrer.startsWith('http') ? data.referrer : `http://${data.referrer}`).hostname || 'unknown';
  sum.referrers[refKey] = (sum.referrers[refKey] || 0) + 1;
  
  writeJSON(ANALYTICS_FILE, analytics);
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

// ── Stats Dashboard ──────────────────────────────────────────────────────────

app.get('/stats', (req, res) => {
  const analytics = readJSON(ANALYTICS_FILE, { requests: [], summary: {} });
  const keys = readJSON(KEYS_FILE, {});
  
  const summary = analytics.summary || {};
  const recentRequests = analytics.requests.slice(-50).reverse(); // Last 50 requests
  
  // Calculate top stats
  const topThemes = Object.entries(summary.themeUsage || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme, count]) => ({ theme, count }));
  
  const topReferrers = Object.entries(summary.referrers || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([referrer, count]) => ({ referrer, count }));
  
  const uniqueIPCount = Object.keys(summary.uniqueIPs || {}).length;
  
  res.json({
    summary: {
      totalRequests: summary.totalRequests || 0,
      paidRequests: summary.paidRequests || 0,
      freeRequests: summary.freeRequests || 0,
      uniqueUsers: uniqueIPCount,
      paidUsers: Object.keys(keys).length,
      lastRequest: summary.lastRequest || null
    },
    topThemes,
    topReferrers,
    recentRequests: recentRequests.map(r => ({
      timestamp: r.ts,
      title: r.title,
      theme: r.theme,
      site: r.site,
      referrer: r.referrer,
      paid: r.paid
    }))
  });
});

app.get('/stats/dashboard', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SnapOG Stats</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f13;
      color: #f1f5f9;
      padding: 2rem;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 0.5rem; color: #6366f1; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { 
      background: #16161f;
      border: 1px solid #1e1e2e;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .card h3 { color: #94a3b8; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
    .card .value { font-size: 2rem; font-weight: 700; color: #f1f5f9; }
    .card .label { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
    .section { margin-bottom: 2rem; }
    .section h2 { margin-bottom: 1rem; font-size: 1.25rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { 
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid #1e1e2e;
    }
    th { color: #94a3b8; font-weight: 500; font-size: 0.875rem; }
    td { color: #f1f5f9; }
    .paid { color: #10b981; }
    .free { color: #6366f1; }
    .refresh { 
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .refresh:hover { background: #4f46e5; }
    code { 
      background: #1e1e2e;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 SnapOG Analytics</h1>
    <p class="subtitle">Real-time usage statistics</p>
    
    <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
    
    <div id="stats">Loading...</div>
  </div>
  
  <script>
    async function loadStats() {
      try {
        const res = await fetch('/stats');
        const data = await res.json();
        
        const html = \`
          <div class="grid">
            <div class="card">
              <h3>Total Requests</h3>
              <div class="value">\${data.summary.totalRequests.toLocaleString()}</div>
            </div>
            <div class="card">
              <h3>Unique Users</h3>
              <div class="value">\${data.summary.uniqueUsers.toLocaleString()}</div>
              <div class="label">Unique IPs</div>
            </div>
            <div class="card">
              <h3>Paid Users</h3>
              <div class="value">\${data.summary.paidUsers}</div>
              <div class="label">\${data.summary.paidRequests} paid requests</div>
            </div>
            <div class="card">
              <h3>Free Tier</h3>
              <div class="value">\${data.summary.freeRequests.toLocaleString()}</div>
              <div class="label">Free requests</div>
            </div>
          </div>
          
          <div class="section">
            <h2>🎨 Top Themes</h2>
            <table>
              <thead>
                <tr>
                  <th>Theme</th>
                  <th>Requests</th>
                </tr>
              </thead>
              <tbody>
                \${data.topThemes.map(t => \`
                  <tr>
                    <td><code>\${t.theme}</code></td>
                    <td>\${t.count.toLocaleString()}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>🔗 Traffic Sources</h2>
            <table>
              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Requests</th>
                </tr>
              </thead>
              <tbody>
                \${data.topReferrers.map(r => \`
                  <tr>
                    <td>\${r.referrer === 'direct' ? '<em>Direct</em>' : r.referrer}</td>
                    <td>\${r.count.toLocaleString()}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>📝 Recent Requests (Last 50)</h2>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Title</th>
                  <th>Theme</th>
                  <th>Referrer</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                \${data.recentRequests.map(r => \`
                  <tr>
                    <td>\${new Date(r.timestamp).toLocaleString()}</td>
                    <td>\${r.title}</td>
                    <td><code>\${r.theme}</code></td>
                    <td>\${r.referrer === 'direct' ? '<em>direct</em>' : r.referrer}</td>
                    <td class="\${r.paid ? 'paid' : 'free'}">\${r.paid ? '💰 Paid' : '🆓 Free'}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>
        \`;
        
        document.getElementById('stats').innerHTML = html;
      } catch (err) {
        document.getElementById('stats').innerHTML = '<p>Error loading stats: ' + err.message + '</p>';
      }
    }
    
    loadStats();
    setInterval(loadStats, 30000); // Auto-refresh every 30s
  </script>
</body>
</html>`);
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
  
  // Analytics logging
  const opts = parseOpts(req.method === 'POST' ? req.body : req.query);
  const analyticsData = {
    ts: new Date().toISOString(),
    title: opts.title?.substring(0, 60),
    theme: opts.theme,
    site: opts.site,
    referrer: req.get('Referer') || req.get('Referrer') || 'direct',
    ua: req.get('User-Agent')?.substring(0, 80),
    ip: ip.substring(0, 15),
    paid: isPaid
  };
  console.log(JSON.stringify(analyticsData));
  logAnalytics(analyticsData);

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

// ── Stripe Checkout ─────────────────────────────────────────────────────────

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'SnapOG API - Lifetime Access',
            description: 'Unlimited OG image generation with 11 themes. One-time payment, lifetime access.',
          },
          unit_amount: 4900, // $49.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://snapog.46-224-13-144.nip.io'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://snapog.46-224-13-144.nip.io'}/buy.html`,
      billing_address_collection: 'auto',
      customer_email: undefined // Let Stripe collect email
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
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

// Stripe webhook — fires on checkout.session.completed
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email || session.metadata?.email;
    const sessionId = session.id;

    if (!email) {
      console.error('No email in Stripe session');
      return res.status(400).json({ error: 'No email in session' });
    }

    console.log(`💰 Stripe payment: ${email} | session ${sessionId}`);

    // Issue API key
    const keys = readJSON(KEYS_FILE, {});
    const newKey = 'sog_' + crypto.randomBytes(20).toString('hex');
    keys[newKey] = { 
      email, 
      created: new Date().toISOString(), 
      source: 'stripe', 
      session_id: sessionId,
      amount: session.amount_total
    };
    writeJSON(KEYS_FILE, keys);

    // Notify via Telegram
    await tgAlert(`💳 *Stripe Payment Received!*\n📧 ${email}\n💰 $${(session.amount_total / 100).toFixed(2)}\n🔑 API key: \`${newKey}\`\n\nFirst revenue! 🎉`);

    console.log(`🔑 API key issued: ${newKey} → ${email}`);
  }

  res.json({ received: true });
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
