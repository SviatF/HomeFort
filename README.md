# DOMERA — Next.js storefront

Premium e-commerce prototype for **domera.shop**.

## Stack
- Next.js 16.2.11 / App Router
- React 19.2
- TypeScript
- Server-rendered pages + static prerendering
- Dynamic product metadata + JSON-LD Product schema
- `sitemap.xml` + `robots.txt`
- Responsive 320–1920px

## Local start
```bash
npm install
npm run dev
```

## Vercel
Import this repository in Vercel. Build command and framework should be detected automatically.

## Demo routes
- `/` — premium Home
- `/catalog`
- `/catalog/beds`
- `/product/milano-soft`
- `/cart`
- `/checkout`
- `/admin` — visual admin shell (backend to be connected next)

## Next implementation phase
1. PostgreSQL / Supabase database
2. Authentication + user account
3. Admin CRUD for products/categories/content
4. Cart persistence + checkout server actions
5. LiqPay / WayForPay / Fondy
6. Nova Poshta API
7. CRM integration
8. GA4 / GTM / Meta / TikTok pixels
9. Merchant Center product feed
10. Media storage and real product catalogue import
