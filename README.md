# 📄 DocMan Hono

A high-performance, secure, and multi-tenant document management system. Rebuilt for speed using **Hono** and **Cloudflare Workers**, integrated with **Supabase** for database and authentication.

---

## ✨ Features

- **Blazing Fast:** Built on Hono and deployed to Cloudflare's global network.
- **Secure Auth:** Integrated with Supabase Auth (SSR) for seamless user management.
- **Type Safe:** End-to-end type safety with TypeScript and Wrangler generated bindings.
- **Cloud-Native:** Leverages Cloudflare Workers' latest features (Smart Placement, Observability).
- **Multi-Tenant Ready:** Designed to handle multiple organizations and isolated data.

## 🛠️ Tech Stack

- **Framework:** [Hono](https://hono.dev/) (The ultra-fast web framework for Edge)
- **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **State Management:** [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/hono)
- **Deployment:** [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## 📂 Project Structure

```text
/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── index.ts            # Main application entry point & Hono instance
│   ├── middleware/         # Hono middleware (Auth, Logging, etc.)
│   ├── routes/             # API and page route handlers
│   └── views/              # UI components and templates
├── supabase/
│   └── migrations/         # Supabase PostgreSQL schema migrations
├── wrangler.jsonc          # Cloudflare Worker configuration
└── tsconfig.json           # TypeScript configuration
```

## ⚙️ Configuration

### Environment Variables

For local development, create a `.dev.vars` file in the root directory:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
```

### Cloudflare Secrets

In production, these values should be set as Cloudflare secrets:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_KEY
```

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Local Development

Start the development server with hot-reloading:

```bash
npm run dev
```

The server will be available at `http://localhost:8787`.

### 3. Deployment

Deploy your application to Cloudflare Workers:

```bash
npm run deploy
```

---

## 🛡️ Security & Observability

- **Observability:** Enabled by default via `wrangler.jsonc`. Logs and traces can be viewed in the Cloudflare Dashboard.
- **Node.js Compatibility:** Enabled for seamless integration with libraries like `@supabase/ssr`.

---

<p align="center">
  Built with ❤️ using Hono & Cloudflare
</p>
