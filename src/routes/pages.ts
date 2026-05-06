import { Hono } from 'hono'
import { layout } from '../views/layout'
import { 
  HomePage, 
  LoginPage, 
  RegisterPage, 
  DashboardPage, 
  DocumentsPage, 
  ContactsPage, 
  SettingsPage 
} from '../views/pages'
import { requireAuth } from '../middleware/auth'

export const pagesRouter = new Hono()

pagesRouter.get('/', (c) => {
  const user = c.get('user')
  if (user) {
    return c.redirect('/dashboard')
  }
  return c.html(layout('Welcome', HomePage()))
})

pagesRouter.get('/login', (c) => {
  const user = c.get('user')
  if (user) {
    return c.redirect('/dashboard')
  }
  
  const error = c.req.query('error')
  const registered = c.req.query('registered') === 'true'
  
  return c.html(layout('Sign In', LoginPage(error, registered)))
})

pagesRouter.get('/register', (c) => {
  const user = c.get('user')
  if (user) {
    return c.redirect('/dashboard')
  }
  
  const error = c.req.query('error')
  
  return c.html(layout('Create Account', RegisterPage(error)))
})

pagesRouter.get('/dashboard', requireAuth, async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organisations(name)')
    .eq('id', user.id)
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(5)

  return c.html(layout('Dashboard', DashboardPage(user, profile, documents || [])))
})

pagesRouter.get('/documents', requireAuth, async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organisations(name)')
    .eq('id', user.id)
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  return c.html(layout('All Documents', DocumentsPage(user, profile, documents || [])))
})

pagesRouter.get('/contacts', requireAuth, async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organisations(name)')
    .eq('id', user.id)
    .single()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('last_name', { ascending: true })

  return c.html(layout('Contacts', ContactsPage(user, profile, contacts || [])))
})

pagesRouter.get('/settings', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const supabase = c.get('supabase')

    console.log("Fetching profile for settings - User ID:", user?.id)
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, organisations(name)')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error("Supabase error fetching profile:", error)
      return c.text("Error fetching profile: " + error.message, 500)
    }

    if (!profile) {
      console.error("No profile found for user:", user.id)
      return c.text("Profile not found", 404)
    }

    console.log("Profile fetched successfully for settings")
    const success = c.req.query('success') === 'true'
    return c.html(layout('Settings', SettingsPage(user, profile, success)))
  } catch (err: any) {
    console.error("Crash in /settings route:", err)
    return c.text("Internal Server Error: " + err.message, 500)
  }
})

pagesRouter.post('/settings', requireAuth, async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')
  const body = await c.req.parseBody()

  const firstName = body.first_name as string
  const lastName = body.last_name as string

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error("Update Profile Error:", error)
    return c.redirect('/settings?error=' + encodeURIComponent(error.message))
  }

  return c.redirect('/settings?success=true')
})
