const { Resvg } = require('@resvg/resvg-js');

const THEMES = {
  dark: { bg: '#0f0f13', accent: '#6366f1', accentLight: '#818cf8', title: '#f1f5f9', desc: '#94a3b8', tag: '#1e1e2e', tagText: '#818cf8', border: '#1e1e2e', dot: '#6366f1' },
  light: { bg: '#ffffff', accent: '#4f46e5', accentLight: '#6366f1', title: '#0f172a', desc: '#475569', tag: '#f1f5f9', tagText: '#4f46e5', border: '#e2e8f0', dot: '#4f46e5' },
  minimal: { bg: '#fafafa', accent: '#18181b', accentLight: '#3f3f46', title: '#09090b', desc: '#52525b', tag: '#f4f4f5', tagText: '#18181b', border: '#e4e4e7', dot: '#18181b' },
  ocean: { bg: '#0c1e35', accent: '#0ea5e9', accentLight: '#38bdf8', title: '#f0f9ff', desc: '#7dd3fc', tag: '#0f2942', tagText: '#38bdf8', border: '#1e3a5f', dot: '#0ea5e9' },
};

function escape(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function wrap(text, max) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + w).length > max && cur) { lines.push(cur.trim()); cur = w + ' '; if (lines.length >= 3) break; }
    else cur += w + ' ';
  }
  if (cur.trim() && lines.length < 3) lines.push(cur.trim());
  return lines;
}

function generateSVG({ title = 'Your Title', description = '', theme: tn = 'dark', site = 'shiplab.xyz' }) {
  const t = THEMES[tn] || THEMES.dark;
  const tl = wrap(title, 36);
  const dl = wrap(description, 58);
  const tfs = tl[0]?.length > 28 ? 44 : 54;
  const tlh = tfs * 1.2;
  const TITLE_Y = 220;
  const DESC_Y = TITLE_Y + tl.length * tlh + 24;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${t.bg}"/>
  <radialGradient id="g1" cx="80%" cy="20%" r="40%"><stop offset="0%" stop-color="${t.accent}" stop-opacity="0.18"/><stop offset="100%" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <radialGradient id="g2" cx="15%" cy="85%" r="30%"><stop offset="0%" stop-color="${t.accentLight}" stop-opacity="0.1"/><stop offset="100%" stop-color="${t.accentLight}" stop-opacity="0"/></radialGradient>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <rect x="0" y="0" width="1200" height="5" fill="${t.accent}"/>
  <circle cx="104" cy="88" r="22" fill="${t.accent}" opacity="0.9"/>
  <circle cx="104" cy="88" r="11" fill="${t.bg}" opacity="0.6"/>
  <text x="140" y="97" font-size="19" fill="${t.desc}" font-family="system-ui,-apple-system,sans-serif" font-weight="600">${escape(site)}</text>
  ${tl.map((line, i) => `<text x="80" y="${TITLE_Y + i * tlh}" font-size="${tfs}" font-weight="800" fill="${t.title}" font-family="system-ui,-apple-system,sans-serif">${escape(line)}</text>`).join('')}
  ${dl.map((line, i) => `<text x="80" y="${DESC_Y + i * 34}" font-size="23" fill="${t.desc}" font-family="system-ui,-apple-system,sans-serif">${escape(line)}</text>`).join('')}
  <rect x="80" y="516" width="170" height="36" rx="18" fill="${t.tag}"/>
  <text x="165" y="540" font-size="14" fill="${t.tagText}" font-family="system-ui,-apple-system,sans-serif" font-weight="600" text-anchor="middle">${escape(site)}</text>
  <circle cx="1100" cy="570" r="6" fill="${t.dot}" opacity="0.4"/>
  <circle cx="1125" cy="555" r="4" fill="${t.dot}" opacity="0.25"/>
  <circle cx="1140" cy="580" r="3" fill="${t.dot}" opacity="0.2"/>
  <circle cx="1080" cy="580" r="5" fill="${t.dot}" opacity="0.3"/>
</svg>`;
}

function generateImage(opts) {
  const svg = generateSVG(opts);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true } });
  return resvg.render().asPng();
}

module.exports = { generateImage, generateSVG, THEMES };
