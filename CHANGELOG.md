# Changelog

All notable changes to SnapOG will be documented in this file.

## [1.0.0] - 2026-02-25

### 🎉 Initial Release

**Features:**
- 11 beautiful themes (dark, light, minimal, ocean, sunset, forest, rose, slate, nord, neon, warm)
- One-time payment model ($49 for unlimited lifetime access)
- Free tier (50 requests/hour, no signup)
- Full Stripe Checkout integration
- Automated API key generation and email delivery
- Real-time analytics dashboard
- Rate limiting (50/hour free, unlimited paid)
- HTTPS with Let's Encrypt SSL
- Sub-200ms average response time
- 1200×630 PNG output (OG image standard)

**Tech Stack:**
- Express.js backend
- resvg-js (Rust-based SVG renderer)
- Stripe payment processing
- Nginx reverse proxy
- Self-hosted on Linux VPS

**API Endpoints:**
- `GET /og` - Generate OG image (query params: title, desc, theme)
- `GET /health` - Health check
- `GET /stats` - Analytics JSON
- `GET /stats/dashboard` - Real-time analytics UI
- `POST /webhook/stripe` - Payment webhook
- `POST /admin/issue-key` - Manual key issuance (admin only)

**Documentation:**
- Comprehensive README with examples
- Live demo on landing page
- API reference
- Framework integration examples (Next.js, Astro, Remix, plain HTML)

**Live URL:** https://snapog.shiplab.xyz

---

## Roadmap

### v1.1.0 (Planned)
- [ ] Custom font upload support
- [ ] Gradients API parameter
- [ ] Image URL parameter (background images)
- [ ] SVG export option
- [ ] Webhook notification on key issuance

### v1.2.0 (Future)
- [ ] Template library (industry-specific designs)
- [ ] Custom branding (logo upload)
- [ ] Multi-language support
- [ ] Dark/light mode auto-detection
- [ ] Analytics API for paid users

---

**Note:** This is a one-time payment product. All future features will be included in the original $49 purchase. No additional fees, ever.
