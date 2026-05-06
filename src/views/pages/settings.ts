import { html } from 'hono/html'
import { Sidebar } from '../components/sidebar'

export const SettingsPage = (user: any, profile: any, success?: boolean) => html`
  <main class="dashboard-layout">
    ${Sidebar(profile, 'settings')}

    <section class="dashboard-content">
      <div class="content-header">
        <h1>Settings</h1>
      </div>

      ${success ? html`<div class="success">Profile updated successfully!</div>` : ''}

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h2>Profile Settings</h2>
          </div>
          <form class="settings-form" method="POST" action="/settings">
            <div class="grid-2">
              <div>
                <label for="first_name">First Name</label>
                <input type="text" id="first_name" name="first_name" value="${profile.first_name}" required />
              </div>
              <div>
                <label for="last_name">Last Name</label>
                <input type="text" id="last_name" name="last_name" value="${profile.last_name}" required />
              </div>
            </div>
            <div>
              <label>Email (Read-only)</label>
              <input type="email" value="${user.email}" disabled style="background-color: #f8fafc; cursor: not-allowed;" />
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Organisation Info</h2>
          </div>
          <div class="org-info">
            <div class="info-item">
              <span class="label">Organisation Name</span>
              <span class="value">${profile.organisations?.name || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="label">Your Role</span>
              <span class="value">Administrator</span>
            </div>
            <div class="info-item">
              <span class="label">Organisation ID</span>
              <span class="value code">${profile.organisation_id}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
`
