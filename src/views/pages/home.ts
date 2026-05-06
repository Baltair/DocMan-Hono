import { html } from 'hono/html'

export const HomePage = () => html`
  <main class="modern-bg">
    <div class="page-logo">
      <a href="/" class="logo">
        <span class="logo-icon">D</span>
        <span class="logo-text">DocMan</span>
      </a>
    </div>
    <div class="hero-content">
      <h1 class="hero-title">Manage your <span class="gradient-text">documents</span> with ease.</h1>
      <p class="hero-subtitle">
        A secure, lightning-fast platform to organize, share, and track all your important files in one place.
      </p>
      <div class="hero-actions">
        <a href="/register" class="btn btn-primary">Get Started</a>
        <a href="/login" class="btn btn-outline">Sign In</a>
      </div>
    </div>
  </main>
`
