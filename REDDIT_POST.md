# Reddit Post Draft — r/SideProject

## Title
[Completed] SnapOG — Open Graph image API with 8 themes ($49 one-time)

## Body

Hey r/SideProject!

I just launched **SnapOG** — an API to generate beautiful Open Graph images for your websites, blogs, and apps.

**What it does:**
- Generate OG images via simple HTTP request
- 8 built-in themes (dark, light, minimal, ocean, sunset, forest, rose, slate)
- Custom text, colors, gradients
- Returns PNG or SVG
- Fast (&lt;100ms response times)

**Why I built it:**
Every SaaS needs good social sharing cards, but setting up Puppeteer/Playwright + managing fonts + hosting is a pain. I wanted a dead-simple API that just works.

**Tech stack:**
- Node.js + Express
- resvg-js for rendering (no browser needed)
- Hosted on dedicated server
- SSL + rate limiting included

**Pricing:**
$49 one-time purchase for lifetime API access. No subscriptions, no monthly fees.

**Demo:**
- https://snapog.shiplab.xyz (live demo + docs)
- Try it: `curl "https://snapog.shiplab.xyz/og?title=Hello+World&theme=ocean"`

**What I learned:**
- resvg-js is WAY faster than Puppeteer for simple graphics
- People love one-time pricing (sick of subscriptions)
- Playwright in Alpine Linux requires extra deps

**Feedback welcome!** Especially on:
- Which themes do you like best?
- What other themes would you want?
- Is $49 too much/little for lifetime access?

Built in 48 hours as part of my "ship 1 product/day" challenge. AMA!

---

**Update:** First customer within 6 hours of posting! 🎉

---

## Engagement Strategy
- Respond to all comments within 1 hour
- Be helpful, not salesy
- Share technical details when asked
- Consider offering 25% off for first 10 customers from Reddit
- Post during peak hours (14:00-16:00 UTC, Monday-Thursday)

## Follow-up Posts (if successful)
- r/webdev — Focus on technical implementation
- r/SaaS — Focus on business model
- r/indiehackers — Focus on validation + revenue
- r/IMadeThis — Show the demo
