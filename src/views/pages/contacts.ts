import { html } from 'hono/html'
import { Sidebar } from '../components/sidebar'

export const ContactsPage = (user: any, profile: any, contacts: any[]) => html`
  <main class="dashboard-layout">
    ${Sidebar(profile, 'contacts')}

    <section class="dashboard-content">
      <div class="content-header">
        <h1>Contacts</h1>
        <div class="actions">
          <button class="btn btn-primary">+ Add Contact</button>
        </div>
      </div>

      <div class="card">
        <div class="contacts-grid">
          ${contacts.length === 0 ? html`
            <div class="empty-state">
              <p>No contacts yet. Build your directory!</p>
            </div>
          ` : contacts.map(contact => html`
            <div class="contact-card">
              <div class="contact-avatar">${contact.first_name[0]}${contact.last_name[0]}</div>
              <div class="contact-info">
                <h3>${contact.first_name} ${contact.last_name}</h3>
                <p class="company">${contact.company || 'Private'}</p>
                <p class="email">${contact.email || 'No email'}</p>
              </div>
              <div class="contact-actions">
                <button class="btn btn-outline btn-sm">Edit</button>
              </div>
            </div>
          `)}
        </div>
      </div>
    </section>
  </main>
`
