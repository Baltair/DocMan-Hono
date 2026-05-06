import { html } from 'hono/html'
import { Sidebar } from '../components/sidebar'

export const DocumentsPage = (user: any, profile: any, documents: any[]) => html`
  <main class="dashboard-layout">
    ${Sidebar(profile, 'documents')}

    <section class="dashboard-content">
      <div class="content-header">
        <h1>All Documents</h1>
        <div class="actions">
          <button class="btn btn-primary">+ Upload New</button>
        </div>
      </div>

      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${documents.length === 0 ? html`
              <tr>
                <td colspan="5" class="empty-row">No documents found.</td>
              </tr>
            ` : documents.map(doc => html`
              <tr>
                <td>
                  <div class="doc-cell">
                    <span class="icon">📄</span>
                    <span>${doc.title}</span>
                  </div>
                </td>
                <td><span class="badge ${doc.status === 'approved' ? 'success' : doc.status === 'review' ? 'warning' : ''}">${doc.status}</span></td>
                <td>${new Date(doc.created_at).toLocaleDateString()}</td>
                <td>${(doc.file_size / 1024).toFixed(1)} KB</td>
                <td>
                  <a href="#" class="text-link">View</a>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </section>
  </main>
`
