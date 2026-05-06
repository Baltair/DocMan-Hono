# DocMan

A secure, multi-tenant document management system built with Astro SSR, Cloudflare Workers, and Supabase.

## 🚀 Tech Stack

- **Framework:** [Astro](https://astro.build/) (Server-Side Rendering)
- **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com/) (`@astrojs/cloudflare` adapter)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Secret Management:** Cloudflare Access Secrets Store

## 📂 Project Structure

```text
/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── components/         # Reusable UI components
│   ├── layouts/            # Page layouts and global styles
│   ├── lib/                # Utilities and Supabase server clients
│   ├── pages/              # File-based routing (pages & API endpoints)
│   ├── env.d.ts            # TypeScript declarations for Cloudflare & Supabase
│   └── middleware.ts       # Route guarding and Supabase session validation
├── supabase/
│   └── migrations/         # Supabase PostgreSQL schema migrations
├── astro.config.mjs        # Astro configuration
└── wrangler.jsonc          # Cloudflare Worker configuration
```

## 🔐 Environment Variables

This project uses Cloudflare's Secret Store feature for production bindings. You must create the following secrets in Cloudflare:

- `SUPABASE_URL`
- `SUPABASE_KEY`

To create these secrets, use the Wrangler CLI:
```sh
npx wrangler secrets-store secret create [YOUR_VALUE] --name SUPABASE_KEY --scopes workers
npx wrangler secrets-store secret create [YOUR_VALUE] --name SUPABASE_URL --scopes workers
```

For local development, create a `.dev.vars` file in the root directory:
```env
SUPABASE_URL="your-supabase-project-url"
SUPABASE_KEY="your-supabase-anon-key"
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                                                |
| :------------------------ | :-------------------------------------------------------------------- |
| `npm install`             | Installs dependencies                                                 |
| `npm run dev`             | Starts local Vite dev server (Astro only, limited Cloudflare context) |
| `npm run build`           | Builds the production site to `./dist/`                               |
| `npx wrangler dev`        | **Recommended:** Preview your build locally using workerd             |
| `npx wrangler deploy`     | Deploys your application to Cloudflare Workers                        |

> **Note:** Do not use `npm run preview`. Because this project relies on Cloudflare-specific runtime bindings (`cloudflare:workers`), you must preview the production build using `npx wrangler dev`.

## 🚢 Deployment

To deploy to Cloudflare Workers, simply run:

```sh
npm run build && npx wrangler deploy
```

Make sure your Cloudflare account has permissions for the Secret Store bindings declared in `wrangler.jsonc`.
