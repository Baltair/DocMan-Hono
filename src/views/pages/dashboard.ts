import { html } from 'hono/html'
import { Sidebar } from '../components/sidebar'

export const DashboardPage = (user: any, profile: any, documents: any[]) => html`
  <main class="dashboard-layout">
    ${Sidebar(profile, 'dashboard')}

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
                <span class="doc-name">${doc.title}</span>
                <span class="doc-meta">${new Date(doc.updated_at).toLocaleDateString()}</span>
              </div>
              <span class="badge ${doc.status === 'approved' ? 'success' : doc.status === 'review' ? 'warning' : ''}">${doc.status}</span>
            </div>
          `)}
        </div>
      </div>
    </section>
  </main>
`
