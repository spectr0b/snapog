# Analytics & Logging TODO

## Current Blind Spot

**Problem:** We're getting organic traffic (75 images, 27 without marketing) but have no idea where it's coming from.

**What we know:**
- 59 images (Feb 21 10:28 UTC) → 75 images (Feb 22 19:32 UTC)
- 16 new organic requests in ~9 hours
- Last activity: 27 minutes ago (20:00 UTC check)

**What we DON'T know:**
- Referrer URLs (where did they come from?)
- User agents (human vs bot?)
- Which themes are popular?
- Which titles/descriptions are being used?
- Repeat users vs new users?
- Geographic location?

## Quick Wins (Add to server.js)

### 1. Basic Request Logging
```javascript
app.get('/og', (req, res) => {
  const { title, description, theme } = req.query;
  const referrer = req.get('Referrer') || 'direct';
  const userAgent = req.get('User-Agent');
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    title: title?.substring(0, 50),
    theme,
    referrer,
    userAgent: userAgent?.substring(0, 100),
    ip: req.ip
  }));
  
  // ... existing image generation
});
```

### 2. Referrer Tracking
Log top referrers to understand traffic sources:
- GitHub README views?
- Search engines (Google, DuckDuckGo)?
- Direct links shared on Discord/Slack?
- Social media (Twitter, LinkedIn)?

### 3. Theme Popularity
Track which themes are actually being used:
```javascript
const themeStats = {};
themeStats[theme] = (themeStats[theme] || 0) + 1;
```

This tells us:
- Which themes to showcase in marketing
- Which themes no one uses (maybe remove?)
- User preferences (dark vs light, minimal vs bold)

### 4. Simple Analytics Dashboard
Create `/admin/stats` endpoint (protected by admin secret):
```javascript
app.get('/admin/stats', requireAdmin, (req, res) => {
  res.json({
    total: stats.total,
    last24h: getLast24Hours(),
    topReferrers: getTopReferrers(),
    topThemes: getTopThemes(),
    recentRequests: getRecent(20)
  });
});
```

## External Analytics Options

### Option A: Plausible (privacy-friendly, $9/mo)
- No cookies, GDPR compliant
- Real-time dashboard
- Referrer tracking, page views

### Option B: Simple Analytics ($9/mo)
- Similar to Plausible
- Clean UI, privacy-focused

### Option C: Google Analytics (free)
- Most powerful, but overkill
- Privacy concerns
- Requires cookie consent

### Option D: Self-hosted (Umami, free)
- Privacy-first
- Own your data
- Requires setup/maintenance

**Recommendation for now:** Add basic logging to server.js (Option 1-3 above). Free, instant, sufficient.

## Questions to Answer

Once we have analytics:

1. **Where is organic traffic coming from?**
   - If GitHub → double down on README optimization
   - If search → focus on SEO content
   - If direct → someone's sharing the link (find where)

2. **What are people using SnapOG for?**
   - Blog posts? (lots of text)
   - Product pages? (short, punchy titles)
   - Social sharing? (varied content)

3. **Free tier conversion potential?**
   - How many unique users?
   - How many requests per user?
   - Are power users hitting the 50/hour limit?

4. **Best time for Reddit post?**
   - If we see traffic spikes at certain hours → post then
   - If weekends vs weekdays matter → time accordingly

## Next Steps

1. Add basic logging to server.js (1 hour)
2. Monitor for 48 hours
3. Analyze traffic sources
4. Optimize based on data
5. Add external analytics if needed

**Key insight:** Can't optimize what we can't measure. Need visibility into organic discovery channels ASAP.
