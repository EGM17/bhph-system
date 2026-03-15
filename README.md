# El Compa Guero Auto Sales — Next.js Website

Bilingual (EN/ES) dealership website with SEO-first architecture, built on Next.js 14, Firebase, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, SSG + ISR) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting + Cloud Functions |
| Styles | Tailwind CSS |
| i18n | next-intl (EN/ES with indexed URLs) |
| Tracking | Google Tag Manager → GA4, Meta Pixel, Hotjar |

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in your Firebase config (from Firebase Console → Project Settings):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=el-compa-guero-895c9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=el-compa-guero-895c9.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Firebase Admin (generate from Firebase Console → Service Accounts):

```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@el-compa-guero-895c9.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Email for lead notifications:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password   # Gmail App Password
EMAIL_TO=info@elcompagueroautosales.com
```

### 3. Run dev server

```bash
npm run dev
# http://localhost:3000
# http://localhost:3000/admin
```

## Deployment

```bash
npm run build
firebase deploy
```

Deploy only rules:
```bash
firebase deploy --only firestore,storage
```

## URL Structure

| Page | English | Spanish |
|------|---------|---------|
| Home | `/` | `/es` |
| Inventory | `/inventory` | `/es/inventario` |
| Vehicle | `/inventory/[slug]` | `/es/inventario/[slug]` |
| Financing | `/financing` | `/es/financiamiento` |
| Contact | `/contact` | `/es/contacto` |
| Blog | `/blog` | `/es/blog` |
| Admin | `/admin` | — |

## SEO

- hreflang on every page (EN/ES)
- Dynamic sitemap.xml with all vehicles + blog posts
- Schema.org: AutoDealer, Car, Article
- ISR revalidation: 5 min for inventory, 1hr for static pages
