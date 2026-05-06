import { html } from 'hono/html'

export const HomePage = () => html`
  <main class="modern-bg">
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

export const LoginPage = (error?: string, registered?: boolean) => html`
  <main class="modern-bg">
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

export const RegisterPage = (error?: string) => html`
  <main class="modern-bg">
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

export const DashboardPage = (user: any, profile: any, documents: any[]) => html`
  <main class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-section">
        <div class="search-box">
          <input type="text" placeholder="Search documents..." />
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <a href="/dashboard" class="sidebar-link active">
          <span class="icon">📊</span> Overview
        </a>
        <a href="/documents" class="sidebar-link">
          <span class="icon">📂</span> All Documents
        </a>
        <a href="/contacts" class="sidebar-link">
          <span class="icon">👤</span> Contacts
        </a>
        <a href="/settings" class="sidebar-link">
          <span class="icon">⚙️</span> Settings
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">${profile?.first_name?.[0] || 'U'}</div>
          <div class="user-info">
            <span class="user-name">${profile?.first_name} ${profile?.last_name}</span>
            <span class="user-org">${profile?.organisations?.name || 'No Organisation'}</span>
          </div>
        </div>
      </div>
    </aside>

    <section class="dashboard-content">
      <div class="content-header">
        <h1>Dashboard</h1>
        <div class="actions">
          <button class="btn btn-primary">+ New Document</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="card stat-card">
          <span class="stat-label">Documents</span>
          <span class="stat-value">${documents.length}</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Pending Reviews</span>
          <span class="stat-value">0</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Storage Used</span>
          <span class="stat-value">0 MB</span>
        </div>
      </div>

      <div class="card recent-docs-card">
        <div class="card-header">
          <h2>Recent Documents</h2>
          <a href="/documents" class="text-link">View All</a>
        </div>
        <div class="docs-list">
          ${documents.length === 0 ? html`
            <div class="empty-state">
              <p>No documents found. Start by uploading one!</p>
            </div>
          ` : documents.map(doc => html`
            <div class="doc-item">
              <div class="doc-icon">📄</div>
              <div class="doc-details">
                <span class="doc-name">${doc.name}</span>
                <span class="doc-meta">${new Date(doc.updated_at).toLocaleDateString()}</span>
              </div>
              <span class="badge ${doc.status === 'final' ? 'success' : doc.status === 'pending' ? 'warning' : ''}">${doc.status}</span>
            </div>
          `)}
        </div>
      </div>
    </section>
  </main>
`
