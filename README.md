# SnapOG — Open Graph Image API

**Beautiful OG images in one line of code. No monthly fees. $49 one-time, use forever.**

[**Try it free →**](http://snapog.46-224-13-144.nip.io/) | [**Buy unlimited access ($49) →**](http://snapog.46-224-13-144.nip.io/buy.html)

## Why SnapOG?

Every OG image service charges $10-20/month. For a simple 1200×630 PNG, that's $240/year.

**SnapOG is different:** Pay once ($49), use unlimited, forever.

## Quick Start

### Free Tier (No signup)
```html
<meta property="og:image" content="http://snapog.46-224-13-144.nip.io/og?title=Your+Title&theme=dark" />
```

That's it. 50 images/hour, completely free, no API key needed.

### Unlimited Tier ($49 one-time)
```bash
curl -H "X-Api-Key: sog_your_key" \
  "http://snapog.46-224-13-144.nip.io/og?title=Your+Title&theme=ocean&desc=Your+description"
```

Unlimited requests, all themes, priority processing.

## 11 Beautiful Themes

| Theme | Preview |
|-------|---------|
| `dark` | Clean dark mode with gradient accent |
| `light` | Minimalist light theme |
| `minimal` | Ultra-clean, typography-focused |
| `ocean` | Blue gradient, professional |
| `sunset` | Warm orange/pink gradient |
| `forest` | Green nature-inspired |
| `rose` | Elegant pink/purple |
| `slate` | Modern gray tones |
| `nord` | Nordic-inspired pastels |
| `neon` | Vibrant cyberpunk style |
| `warm` | Cozy earth tones |

## API Reference

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | Required | Main heading text |
| `desc` | string | Optional | Subtitle/description |
| `theme` | string | `dark` | One of 11 themes |

### Response

- **Format:** PNG image (1200×630)
- **Speed:** <200ms average
- **Cache:** 24 hours

### Rate Limits

- **Free tier:** 50 requests/hour (no key)
- **Paid tier:** Unlimited (with API key)

## Use Cases

### Next.js
```tsx
// app/layout.tsx
export const metadata = {
  openGraph: {
    images: [`http://snapog.46-224-13-144.nip.io/og?title=${title}&theme=ocean`],
  },
};
```

### Astro
```astro
---
const ogImage = `http://snapog.46-224-13-144.nip.io/og?title=${Astro.props.title}&theme=dark`;
---
<meta property="og:image" content={ogImage} />
```

### Remix
```tsx
export const meta = () => [
  {
    property: "og:image",
    content: `http://snapog.46-224-13-144.nip.io/og?title=${title}&theme=sunset`,
  },
];
```

### Plain HTML
```html
<meta property="og:image" content="http://snapog.46-224-13-144.nip.io/og?title=My+Blog+Post&theme=minimal" />
```

## Pricing

| Tier | Price | Requests | Themes | Support |
|------|-------|----------|--------|---------|
| Free | $0 | 50/hour | All 11 | Community |
| Unlimited | **$49 one-time** | ∞ | All 11 | Email |

**No subscriptions. No hidden fees. Pay once, use forever.**

[**Get unlimited access →**](http://snapog.46-224-13-144.nip.io/buy.html)

## Why One-Time Payment?

Most SaaS charges monthly because they need recurring revenue. We don't.

We built SnapOG to scratch our own itch: **why pay $240/year for something that costs $0.01/month to run?**

So we charge what it's worth: $49 once, use unlimited, forever.

## Tech Stack

- **Rendering:** resvg-js (Rust-based SVG renderer)
- **Framework:** Express.js
- **Payment:** Stripe Checkout
- **Hosting:** Self-hosted, SSL via Let's Encrypt

## FAQ

**Q: Can I use the free tier in production?**  
A: Yes! 50/hour is ~1.2M requests/month. Most sites never hit that.

**Q: What happens if I exceed free tier limits?**  
A: Requests return 429 (rate limited). Upgrade to unlimited for $49.

**Q: Do you store my images?**  
A: No. Images are generated on-demand and cached for 24h.

**Q: Can I self-host?**  
A: Yes! Code is open source. Or just use our hosted version.

**Q: Refund policy?**  
A: 30-day money-back guarantee, no questions asked.

## Support

- **Issues:** [GitHub Issues](https://github.com/spectr0b/snapog/issues)
- **Email:** support@snapog.shiplab.xyz
- **Docs:** [snapog.shiplab.xyz](http://snapog.46-224-13-144.nip.io/)

## License

MIT — do whatever you want with it.

---

**Built by developers, for developers. No BS. No monthly fees. Just $49 once.**

[**Try free →**](http://snapog.46-224-13-144.nip.io/) | [**Buy unlimited ($49) →**](http://snapog.46-224-13-144.nip.io/buy.html)
