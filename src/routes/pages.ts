import { Hono } from 'hono'
import { layout } from '../views/layout'
import { HomePage, LoginPage, RegisterPage, DashboardPage } from '../views/pages'
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

  // Fetch profile with organisation details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organisations(name)')
    .eq('id', user.id)
    .single()

  // Fetch recent documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(5)

  return c.html(layout('Dashboard', DashboardPage(user, profile, documents || [])))
})
