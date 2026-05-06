import { html } from 'hono/html'

export const Sidebar = (profile: any, activePage: string) => html`
  <aside class="sidebar">
    <div class="sidebar-header">
      <a href="/" class="logo">
        <span class="logo-icon">D</span>
        <span class="logo-text">DocMan</span>
      </a>
    </div>
    <nav class="sidebar-nav">
      <a href="/dashboard" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">
        <span class="icon">📊</span> Overview
      </a>
      <a href="/documents" class="sidebar-link ${activePage === 'documents' ? 'active' : ''}">
        <span class="icon">📂</span> All Documents
      </a>
      <a href="/contacts" class="sidebar-link ${activePage === 'contacts' ? 'active' : ''}">
        <span class="icon">👤</span> Contacts
      </a>
      <a href="/settings" class="sidebar-link ${activePage === 'settings' ? 'active' : ''}">
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
      <form action="/api/auth/logout" method="POST">
        <button type="submit" class="btn-signout">Sign Out</button>
      </form>
    </div>
  </aside>
`
