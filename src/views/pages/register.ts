import { html } from 'hono/html'

export const RegisterPage = (error?: string) => html`
  <main class="modern-bg">
    <div class="page-logo">
      <a href="/" class="logo">
        <span class="logo-icon">D</span>
        <span class="logo-text">DocMan</span>
      </a>
    </div>
    <div class="card auth-card">
      <div class="auth-header">
        <h1>Create Account</h1>
        <p>Join DocMan to securely manage your organisation's documents</p>
      </div>

      ${error ? html`<div class="success" style="color:#b91c1c;background-color:#fef2f2;border-color:#fecaca">${error}</div>` : ''}

      <form method="POST" action="/api/auth/register">
        <div class="grid-2">
          <div>
            <label for="first_name">First Name</label>
            <input type="text" id="first_name" name="first_name" placeholder="Jane" required />
          </div>
          <div>
            <label for="last_name">Last Name</label>
            <input type="text" id="last_name" name="last_name" placeholder="Doe" required />
          </div>
        </div>
        <div>
          <label for="email">Email address</label>
          <input type="email" id="email" name="email" placeholder="jane@company.com" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="••••••••" minlength="8" required />
          <p class="helper-text">Minimum 8 characters</p>
        </div>
        <button type="submit" class="btn btn-primary w-full">Get Started</button>
      </form>

      <div class="auth-footer">
        <p>
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  </main>
`
