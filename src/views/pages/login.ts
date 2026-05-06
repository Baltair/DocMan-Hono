import { html } from 'hono/html'

export const LoginPage = (error?: string, registered?: boolean) => html`
  <main class="modern-bg">
    <div class="page-logo">
      <a href="/" class="logo">
        <span class="logo-icon">D</span>
        <span class="logo-text">DocMan</span>
      </a>
    </div>
    <div class="card auth-card">
      <div class="auth-header">
        <h1>Welcome Back</h1>
        <p>Enter your credentials to access your account</p>
      </div>

      ${registered ? html`<div class="success">Account created! Please sign in.</div>` : ''}
      ${error ? html`<div class="success" style="color:#b91c1c;background-color:#fef2f2;border-color:#fecaca">${error}</div>` : ''}

      <form method="POST" action="/api/auth/login">
        <div>
          <label for="email">Email address</label>
          <input type="email" id="email" name="email" placeholder="name@company.com" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary w-full">Sign In</button>
      </form>

      <div class="auth-footer">
        <p>
          Don't have an account? <a href="/register">Create one for free</a>
        </p>
      </div>
    </div>
  </main>
`
