# 7 Common OG Image Mistakes (and How to Fix Them)

Making these mistakes? Your click-through rate is suffering. Here's how to fix them.

## Mistake #1: Wrong Image Dimensions

**The Problem:**  
Using 1200x1200 (square) or random dimensions. Platforms crop your image weirdly, cutting off important text.

**Why It Happens:**  
People assume "bigger is better" or copy dimensions from Instagram (which uses square).

**The Fix:**  
Always use **1200x630** (or 1200x600). This is the standard OG image size that works everywhere.

```html
❌ Bad: 1200x1200 (gets cropped on Twitter)
✅ Good: 1200x630 (perfect everywhere)
```

**SnapOG automatically generates 1200x630** — no configuration needed.

---

## Mistake #2: Text Too Small to Read

**The Problem:**  
Your OG image looks great at full size (1200px wide), but when shared on Twitter/LinkedIn it displays at ~400px wide. The text becomes unreadable.

**Why It Happens:**  
Designing at full resolution without testing at actual display size.

**The Fix:**  
Keep titles under **60 characters** and use large font sizes (60pt+).

```html
❌ Bad: "How to Build a High-Performance, Scalable, Production-Ready React Application with TypeScript"
✅ Good: "Building Production React Apps"
```

**SnapOG uses 60pt+ fonts** for readability at small sizes.

---

## Mistake #3: Not URL-Encoding Parameters

**The Problem:**  
Special characters (`&`, `?`, `#`, spaces) in titles break the URL or get interpreted as URL parameters.

**Why It Happens:**  
Developers forget that OG image URLs are still URLs and need proper encoding.

**The Fix:**  
Always use `encodeURIComponent()` in JavaScript:

```javascript
❌ Bad:
const ogUrl = `https://api.com/og?title=Coffee & Code`
// & gets interpreted as a new parameter

✅ Good:
const ogUrl = `https://api.com/og?title=${encodeURIComponent('Coffee & Code')}`
// Becomes: ?title=Coffee%20%26%20Code
```

**In plain HTML:**  
Use online URL encoder or manually replace:
- Space → `%20`
- `&` → `%26`
- `?` → `%3F`

---

## Mistake #4: Not Testing on All Platforms

**The Problem:**  
Your OG image looks perfect on Twitter but broken on LinkedIn, or vice versa.

**Why It Happens:**  
Each platform has slightly different requirements and caching behavior.

**The Fix:**  
Test on **all major platforms** before going live:

1. **Twitter Card Validator**  
   https://cards-dev.twitter.com/validator

2. **LinkedIn Post Inspector**  
   https://www.linkedin.com/post-inspector/

3. **Facebook Sharing Debugger**  
   https://developers.facebook.com/tools/debug/

4. **Slack**  
   Paste your URL in any Slack channel

**If it looks good on these 4, you're set.**

---

## Mistake #5: No Fallback OG Image

**The Problem:**  
Your homepage and landing pages have custom OG images, but blog posts and other pages show nothing (or worse, a broken image).

**Why It Happens:**  
Only setting OG images on specific pages, not having a site-wide default.

**The Fix:**  
Set a default OG image in your root layout:

```typescript
// app/layout.tsx (Next.js)
export const metadata = {
  title: 'My App',
  openGraph: {
    images: ['http://snapog.46-224-13-144.nip.io/og?title=My%20App&theme=gradient'],
  },
}
```

Then override per-page as needed:

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    openGraph: {
      images: [`http://snapog.46-224-13-144.nip.io/og?title=${encodeURIComponent(post.title)}&theme=ocean`],
    },
  };
}
```

**Every page gets an OG image** — either custom or fallback.

---

## Mistake #6: Ignoring Cache (or Fighting It)

**The Problem:**  
You update your OG image but Twitter/LinkedIn still shows the old version for days.

**Why It Happens:**  
Social platforms **aggressively cache** OG images (sometimes for weeks).

**The Fix:**

### Option A: Force refresh with cache-busting
```javascript
const ogUrl = `https://api.com/og?title=My+Title&v=${Date.now()}`
// Adding a unique parameter forces platforms to fetch new image
```

### Option B: Use platform tools to clear cache
- Twitter: Use Card Validator (fetches fresh)
- LinkedIn: Use Post Inspector (fetches fresh)
- Facebook: Use Sharing Debugger → "Scrape Again"

### Option C: Embrace the cache
For static content (product pages, landing pages), caching is good — it's free CDN. Don't fight it.

**SnapOG images are cacheable by design** — once generated, they're stable.

---

## Mistake #7: Using a Monthly Subscription for Static Images

**The Problem:**  
Paying $10-30/month for OG image generation when you're using it on 3-5 pages that rarely change.

**Why It Happens:**  
Default assumption that SaaS = better than DIY.

**The Fix:**  
Ask yourself:

- **How often do you update OG images?**  
  If rarely → Static images or one-time tools
  
- **How many pages need dynamic OG images?**  
  If <20 → Static images (Figma + export)  
  If 20-500 → Dynamic generation (one-time cost)  
  If 500+ → Consider DIY (Vercel OG) or one-time API

**Cost comparison (2 years):**
- Bannerbear: $1,176
- Cloudinary: $2,136
- **SnapOG: $49**
- Static images: $0 (but high manual labor)

**For most projects:** One-time cost > monthly subscription

---

## Bonus: Less Common Mistakes

### Not Setting og:title and og:description
OG images complement text, they don't replace it. Always set:

```html
<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="Clear, compelling description" />
<meta property="og:image" content="https://..." />
```

### Using HTTP instead of HTTPS
Some platforms (LinkedIn) reject HTTP images. Always use HTTPS in production.

(SnapOG currently uses HTTP on `nip.io` domain for development — use HTTPS in production)

### Forgetting Mobile Preview
OG images appear on mobile feeds too. Test on actual mobile devices, not just desktop validators.

### Too Much Text
If you need a paragraph to explain your page, your OG image is doing too much work. Keep it simple.

### No Branding
If your OG image could work for any random site, you're missing an opportunity. Add subtle branding (logo, colors, consistent theme).

---

## Quick Checklist

Before deploying your OG images, check:

- [ ] Dimensions: 1200x630 ✓
- [ ] Text is large and readable ✓
- [ ] All parameters are URL-encoded ✓
- [ ] Tested on Twitter, LinkedIn, Facebook, Slack ✓
- [ ] Fallback image set for all pages ✓
- [ ] Cache strategy understood ✓
- [ ] Cost-effective solution (not overpaying) ✓

---

## Fix Them All at Once

**SnapOG handles most of these automatically:**
- ✅ Correct dimensions (1200x630)
- ✅ Large, readable fonts
- ✅ Fast generation (<200ms)
- ✅ 11 themes (consistent branding)
- ✅ One-time cost ($49, no subscription)

**What you still need to do:**
- URL-encode your parameters
- Test on all platforms
- Set fallback images

**Try it free:** [snapog.46-224-13-144.nip.io](http://snapog.46-224-13-144.nip.io/)

---

## Questions?

- **GitHub Issues:** [github.com/spectr0b/snapog/issues](https://github.com/spectr0b/snapog/issues)
- **Email:** support@snapog.shiplab.xyz
- **Examples:** See [EXAMPLES.md](./EXAMPLES.md) for real-world use cases
