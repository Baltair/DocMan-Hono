import { Hono } from 'hono'
import { createSupabaseClient } from '../middleware/auth'

export const authRouter = new Hono()

authRouter.post('/login', async (c) => {
  const supabase = await createSupabaseClient(c)
  const body = await c.req.parseBody()
  
  const email = body.email as string
  const password = body.password as string

  console.log("Attempting to sign in with password...")
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  console.log("Sign in call completed.")

  if (error) {
    return c.redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return c.redirect('/dashboard')
})

authRouter.post('/register', async (c) => {
  const supabase = await createSupabaseClient(c)
  const body = await c.req.parseBody()
  
  const email = body.email as string
  const password = body.password as string
  const firstName = body.first_name as string
  const lastName = body.last_name as string

  console.log("Attempting to sign up...")
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })
  console.log("Sign up call completed.")

  if (error) {
    console.error("Supabase SignUp Error:", error)
    return c.redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  return c.redirect('/login?registered=true')
})

authRouter.post('/logout', async (c) => {
  const supabase = await createSupabaseClient(c)
  await supabase.auth.signOut()
  return c.redirect('/')
})
