# How to Add Dynamic OG Images to Your Next.js App (5 Minutes)

Stop using static OG images that never update. Here's how to add dynamic Open Graph images to your Next.js app in under 5 minutes.

## What You'll Build

Every page in your Next.js app will automatically get a custom OG image based on the page title and description. When you share a link on Twitter, LinkedIn, or Slack, it'll look professional — no manual design work needed.

## Step 1: Choose Your Approach

### Option A: Free Tier (No signup, 50 images/hour)
Perfect for side projects, personal blogs, small apps.

### Option B: Unlimited ($49 one-time)
For production apps, high-traffic sites, or if you want custom API keys.

**For this tutorial, we'll use the free tier.** You can upgrade later if needed.

## Step 2: Update Your Root Layout

Open `app/layout.tsx` (or `app/layout.js`) and add the OG image:

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Awesome App',
  description: 'Does amazing things',
  openGraph: {
    title: 'My Awesome App',
    description: 'Does amazing things',
    images: [
      {
        url: 'http://snapog.46-224-13-144.nip.io/og?title=My%20Awesome%20App&description=Does%20amazing%20things&theme=gradient',
        width: 1200,
        height: 630,
      }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**That's it for the global fallback.** Every page now has a default OG image.

## Step 3: Add Per-Page OG Images

Want each page to have its own custom image? Override metadata in individual pages:

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug) // Your CMS/data fetch
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: `http://snapog.46-224-13-144.nip.io/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt)}&theme=ocean`,
          width: 1200,
          height: 630,
        }
      ],
    },
  }
}
```

Now every blog post gets a unique OG image with its actual title and excerpt.

## Step 4: Pick a Theme

SnapOG has 11 built-in themes. Try them all and pick your favorite:

- **gradient** — Purple/blue gradient (Twitter-friendly)
- **dark** — Clean black background, white text
- **ocean** — Professional blue
- **minimal** — Pure white, ultra-clean
- **sunset** — Warm orange/pink
- **forest** — Calm green
- **nord** — Developer favorite (Nordic palette)
- **neon** — Cyberpunk vibes
- **warm** — Earthy tones
- **tech** — Grid pattern, techy feel
- **bold** — High contrast, punchy colors

Just change `&theme=gradient` to `&theme=ocean` (or any other theme).

## Step 5: Test Your OG Images

Before deploying, test in these validators:

1. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
2. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
3. **Facebook Debug Tool:** https://developers.facebook.com/tools/debug/
4. **Slack:** Paste your URL in any Slack channel

If it looks good on these 4, you're set.

## Advanced: Dynamic Themes Per Page

Want blog posts to use "ocean" theme, but product pages to use "gradient"?

```typescript
// app/blog/[slug]/page.tsx
const ogImage = `http://snapog.46-224-13-144.nip.io/og?title=${encodeURIComponent(post.title)}&theme=ocean`

// app/products/[id]/page.tsx
const ogImage = `http://snapog.46-224-13-144.nip.io/og?title=${encodeURIComponent(product.name)}&theme=gradient`
```

Mix and match themes across your site.

## Upgrading to Unlimited

Using more than 50 images/hour? Want custom API keys? Upgrade to unlimited:

1. Buy an API key: [http://snapog.46-224-13-144.nip.io/buy.html](http://snapog.46-224-13-144.nip.io/buy.html) ($49 one-time)
2. Add the key to your `.env.local`:
   ```
   SNAPOG_API_KEY=sog_your_key_here
   ```
3. Update your OG image URL:
   ```typescript
   const ogImage = `http://snapog.46-224-13-144.nip.io/og?title=${encodeURIComponent(title)}&theme=gradient&key=${process.env.SNAPOG_API_KEY}`
   ```

That's it. Unlimited images, no rate limits.

## Performance Tips

### 1. URL encode everything
Always use `encodeURIComponent()` for titles and descriptions:

```typescript
❌ Bad:  `?title=My Blog & Stuff`
✅ Good: `?title=${encodeURIComponent('My Blog & Stuff')}`
```

### 2. Cache at the edge
Add this to your `next.config.js` to cache OG images at the CDN:

```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'snapog.46-224-13-144.nip.io',
      },
    ],
  },
}
```

### 3. Preload critical OG images
For your most-shared pages (homepage, main product page), preload the OG image:

```typescript
<link rel="preload" as="image" href={ogImageUrl} />
```

## Common Issues

### OG image not showing up

1. Check if you URL-encoded the title/description
2. Clear platform cache (Twitter, LinkedIn, etc. cache aggressively)
3. Use validators to debug
4. Make sure your URL is publicly accessible (not localhost)

### Image looks cut off

OG images should be **1200x630** (or 1200x600). SnapOG generates 1200x630 by default — no action needed.

### Text is too long

Keep titles under 60 characters, descriptions under 120 characters. Otherwise text might overflow.

## What's Next?

- Try all 11 themes and pick your favorites
- Add OG images to your other projects (Astro, Remix, etc.)
- Monitor click-through rates before/after (expect 2-3x improvement)

Questions? [Open an issue](https://github.com/spectr0b/snapog/issues) or email support@snapog.shiplab.xyz.

---

**SnapOG:** [snapog.46-224-13-144.nip.io](http://snapog.46-224-13-144.nip.io/)  
**Source:** [github.com/spectr0b/snapog](https://github.com/spectr0b/snapog)  
**Pricing:** Free (50/hour) or $49 unlimited, one-time
