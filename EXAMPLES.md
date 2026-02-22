# SnapOG Examples - Real-World Use Cases

See SnapOG in action with these ready-to-use examples. Click any link to see the generated OG image.

## Basic Examples

### Simple Title (Dark Theme)
```
http://snapog.46-224-13-144.nip.io/og?title=Hello%20World&theme=dark
```
[View Image →](http://snapog.46-224-13-144.nip.io/og?title=Hello%20World&theme=dark)

**Use case:** Minimalist landing page, dark mode app

---

### Title + Description (Gradient)
```
http://snapog.46-224-13-144.nip.io/og?title=Build%20Fast%2C%20Ship%20Faster&description=No-code%20tools%20for%20indie%20hackers&theme=gradient
```
[View Image →](http://snapog.46-224-13-144.nip.io/og?title=Build%20Fast%2C%20Ship%20Faster&description=No-code%20tools%20for%20indie%20hackers&theme=gradient)

**Use case:** SaaS landing page, product launch

---

## Framework-Specific Examples

### Next.js App Router
```typescript
// app/page.tsx
export const metadata = {
  title: 'AI Writing Assistant',
  description: 'Write better content 10x faster',
  openGraph: {
    images: [{
      url: 'http://snapog.46-224-13-144.nip.io/og?title=AI%20Writing%20Assistant&description=Write%20better%20content%2010x%20faster&theme=ocean',
      width: 1200,
      height: 630,
    }],
  },
}
```
[Preview OG Image →](http://snapog.46-224-13-144.nip.io/og?title=AI%20Writing%20Assistant&description=Write%20better%20content%2010x%20faster&theme=ocean)

---

### Astro Blog Post
```astro
---
// src/pages/blog/[slug].astro
const { title, excerpt } = Astro.props;
const ogImage = `http://snapog.46-224-13-144.nip.io/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(excerpt)}&theme=minimal`;
---
<head>
  <meta property="og:image" content={ogImage} />
</head>
```
[Example: "10 Tips for Better Code Reviews" →](http://snapog.46-224-13-144.nip.io/og?title=10%20Tips%20for%20Better%20Code%20Reviews&description=Ship%20faster%20without%20breaking%20things&theme=minimal)

---

### Remix Loader
```typescript
// app/routes/products.$id.tsx
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const ogUrl = `http://snapog.46-224-13-144.nip.io/og?title=${encodeURIComponent(data.name)}&description=${encodeURIComponent(data.tagline)}&theme=sunset`;
  
  return [
    { title: data.name },
    { property: "og:image", content: ogUrl },
  ];
};
```
[Example: Product Page →](http://snapog.46-224-13-144.nip.io/og?title=TaskFlow%20Pro&description=Project%20management%20for%20remote%20teams&theme=sunset)

---

## Theme Showcase

### Professional (Ocean Theme)
```
http://snapog.46-224-13-144.nip.io/og?title=Annual%20Report%202026&description=Financial%20results%20and%20key%20insights&theme=ocean
```
[View →](http://snapog.46-224-13-144.nip.io/og?title=Annual%20Report%202026&description=Financial%20results%20and%20key%20insights&theme=ocean)

**Best for:** Corporate sites, professional blogs, B2B SaaS

---

### Developer-Friendly (Nord Theme)
```
http://snapog.46-224-13-144.nip.io/og?title=React%20Hooks%20Guide&description=Master%20useState%2C%20useEffect%2C%20and%20custom%20hooks&theme=nord
```
[View →](http://snapog.46-224-13-144.nip.io/og?title=React%20Hooks%20Guide&description=Master%20useState%2C%20useEffect%2C%20and%20custom%20hooks&theme=nord)

**Best for:** Dev blogs, documentation, technical tutorials

---

### Bold & Eye-Catching (Neon Theme)
```
http://snapog.46-224-13-144.nip.io/og?title=Launch%20Week%20Day%203&description=New%20features%20dropping%20every%20day&theme=neon
```
[View →](http://snapog.46-224-13-144.nip.io/og?title=Launch%20Week%20Day%203&description=New%20features%20dropping%20every%20day&theme=neon)

**Best for:** Product launches, announcements, events

---

### Warm & Inviting (Warm Theme)
```
http://snapog.46-224-13-144.nip.io/og?title=Coffee%20%26%20Code&description=Weekly%20newsletter%20for%20indie%20hackers&theme=warm
```
[View →](http://snapog.46-224-13-144.nip.io/og?title=Coffee%20%26%20Code&description=Weekly%20newsletter%20for%20indie%20hackers&theme=warm)

**Best for:** Lifestyle blogs, newsletters, community projects

---

### Ultra-Clean (Minimal Theme)
```
http://snapog.46-224-13-144.nip.io/og?title=Design%20System&description=Components%2C%20patterns%2C%20and%20principles&theme=minimal
```
[View →](http://snapog.46-224-13-144.nip.io/og?title=Design%20System&description=Components%2C%20patterns%2C%20and%20principles&theme=minimal)

**Best for:** Design portfolios, minimalist brands, documentation

---

## Industry-Specific Examples

### SaaS Product
```html
<meta property="og:title" content="InvoiceKit - Freelance Invoicing Made Simple" />
<meta property="og:description" content="Send professional invoices in under 60 seconds. No monthly fees." />
<meta property="og:image" content="http://snapog.46-224-13-144.nip.io/og?title=InvoiceKit&description=Freelance%20invoicing%20made%20simple&theme=ocean" />
```
[Preview →](http://snapog.46-224-13-144.nip.io/og?title=InvoiceKit&description=Freelance%20invoicing%20made%20simple&theme=ocean)

---

### Tech Blog
```html
<meta property="og:image" content="http://snapog.46-224-13-144.nip.io/og?title=Why%20I%20Ditched%20Redux%20for%20Zustand&description=State%20management%20doesn%27t%20have%20to%20be%20complicated&theme=nord" />
```
[Preview →](http://snapog.46-224-13-144.nip.io/og?title=Why%20I%20Ditched%20Redux%20for%20Zustand&description=State%20management%20doesn%27t%20have%20to%20be%20complicated&theme=nord)

---

### E-commerce
```html
<meta property="og:image" content="http://snapog.46-224-13-144.nip.io/og?title=Flash%20Sale%20-%2050%25%20Off&description=Limited%20time%20offer%20on%20all%20winter%20collection&theme=sunset" />
```
[Preview →](http://snapog.46-224-13-144.nip.io/og?title=Flash%20Sale%20-%2050%25%20Off&description=Limited%20time%20offer%20on%20all%20winter%20collection&theme=sunset)

---

### Developer Tool
```html
<meta property="og:image" content="http://snapog.46-224-13-144.nip.io/og?title=CronHost%20API&description=Serverless%20cron%20jobs%20with%20webhook%20delivery&theme=tech" />
```
[Preview →](http://snapog.46-224-13-144.nip.io/og?title=CronHost%20API&description=Serverless%20cron%20jobs%20with%20webhook%20delivery&theme=tech)

---

## Dynamic Content Examples

### Blog Post (from CMS)
```javascript
// Fetch post data
const post = await cms.getPost(slug);

// Generate OG image URL
const ogImageUrl = `http://snapog.46-224-13-144.nip.io/og?` +
  `title=${encodeURIComponent(post.title)}` +
  `&description=${encodeURIComponent(post.excerpt)}` +
  `&theme=gradient`;

// Use in meta tags
return { ogImage: ogImageUrl };
```

**Example output:** [Dynamic Blog Post →](http://snapog.46-224-13-144.nip.io/og?title=Shipping%201%20Product%20Per%20Day%20for%2030%20Days&description=What%20I%20learned%20building%2030%20side%20projects%20in%20a%20month&theme=gradient)

---

### User Profile
```javascript
const username = "johndoe";
const bio = "Full-stack developer | Open source enthusiast";

const ogUrl = `http://snapog.46-224-13-144.nip.io/og?` +
  `title=${encodeURIComponent(`@${username}`)}` +
  `&description=${encodeURIComponent(bio)}` +
  `&theme=dark`;
```

[Example Profile →](http://snapog.46-224-13-144.nip.io/og?title=@johndoe&description=Full-stack%20developer%20%7C%20Open%20source%20enthusiast&theme=dark)

---

### Event Page
```javascript
const event = {
  name: "React Conf 2026",
  date: "March 15-17, 2026",
  location: "San Francisco"
};

const ogUrl = `http://snapog.46-224-13-144.nip.io/og?` +
  `title=${encodeURIComponent(event.name)}` +
  `&description=${encodeURIComponent(`${event.date} • ${event.location}`)}` +
  `&theme=neon`;
```

[Example Event →](http://snapog.46-224-13-144.nip.io/og?title=React%20Conf%202026&description=March%2015-17%2C%202026%20%E2%80%A2%20San%20Francisco&theme=neon)

---

## Testing Your OG Images

After implementing, test your OG images in these validators:

1. **Twitter Card Validator**  
   https://cards-dev.twitter.com/validator

2. **LinkedIn Post Inspector**  
   https://www.linkedin.com/post-inspector/

3. **Facebook Sharing Debugger**  
   https://developers.facebook.com/tools/debug/

4. **Slack**  
   Just paste your URL in any channel

---

## Tips for Better OG Images

### Keep titles short
❌ "How to Build a High-Performance, Scalable, Production-Ready React Application with TypeScript, Redux, and Best Practices"
✅ "Building Production React Apps"

### Use clear descriptions
❌ "Learn stuff about things"
✅ "Master React Hooks in 30 minutes"

### Pick the right theme
- **Professional content** → ocean, minimal, nord
- **Fun/creative content** → neon, sunset, warm
- **Technical content** → dark, tech, nord
- **General purpose** → gradient (works everywhere)

### URL encode everything
Always use `encodeURIComponent()`:
```javascript
❌ `?title=Hello & Welcome`
✅ `?title=${encodeURIComponent('Hello & Welcome')}`
```

---

## All 11 Themes Side-by-Side

| Theme | Preview Link |
|-------|--------------|
| dark | [View →](http://snapog.46-224-13-144.nip.io/og?title=Dark%20Theme&theme=dark) |
| gradient | [View →](http://snapog.46-224-13-144.nip.io/og?title=Gradient%20Theme&theme=gradient) |
| ocean | [View →](http://snapog.46-224-13-144.nip.io/og?title=Ocean%20Theme&theme=ocean) |
| minimal | [View →](http://snapog.46-224-13-144.nip.io/og?title=Minimal%20Theme&theme=minimal) |
| sunset | [View →](http://snapog.46-224-13-144.nip.io/og?title=Sunset%20Theme&theme=sunset) |
| forest | [View →](http://snapog.46-224-13-144.nip.io/og?title=Forest%20Theme&theme=forest) |
| nord | [View →](http://snapog.46-224-13-144.nip.io/og?title=Nord%20Theme&theme=nord) |
| neon | [View →](http://snapog.46-224-13-144.nip.io/og?title=Neon%20Theme&theme=neon) |
| warm | [View →](http://snapog.46-224-13-144.nip.io/og?title=Warm%20Theme&theme=warm) |
| tech | [View →](http://snapog.46-224-13-144.nip.io/og?title=Tech%20Theme&theme=tech) |
| bold | [View →](http://snapog.46-224-13-144.nip.io/og?title=Bold%20Theme&theme=bold) |

---

## Get Started

**Free tier:** Try any example above (50 requests/hour, no signup)

**Unlimited:** [$49 one-time →](http://snapog.46-224-13-144.nip.io/buy.html)

**Questions?** [GitHub Issues](https://github.com/spectr0b/snapog/issues) | support@snapog.shiplab.xyz
