import { html } from 'hono/html'

export const layout = (title: string, content: any) => html`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="DocMan — Secure Document Management at the Edge" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">
    <title>${title} | DocMan</title>
  </head>
  <body>
    <header class="main-header">
      <div class="container header-content">
        <a href="/" class="logo">
          <span class="logo-icon">D</span>
          <span class="logo-text">DocMan</span>
        </a>
        <nav class="main-nav">
          <a href="/dashboard" class="nav-link">Dashboard</a>
          <a href="/documents" class="nav-link">Documents</a>
          <a href="/contacts" class="nav-link">Contacts</a>
        </nav>
      </div>
    </header>
    <div class="app-container">
      ${content}
    </div>
  </body>
</html>
`
