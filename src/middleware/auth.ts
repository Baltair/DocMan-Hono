import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import type { Context, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'

function extractSecret(secret: any): string {
  if (typeof secret === 'string') return secret;
  if (secret && typeof secret === 'object' && 'secret' in secret) return secret.secret;
  if (secret && typeof secret === 'object' && 'value' in secret) return secret.value;
  return '';
}

export const createSupabaseClient = (c: Context) => {
  const supabaseUrl = extractSecret(c.env.PUBLIC_SUPABASE_URL || c.env.SUPABASE_URL)
  const supabaseKey = extractSecret(c.env.PUBLIC_SUPABASE_KEY || c.env.SUPABASE_KEY)

  console.log("Supabase Client Init - URL:", supabaseUrl)
  console.log("Supabase Client Init - Key Length:", supabaseKey?.length)

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        const cookieHeader = c.req.header('Cookie') ?? ''
        return parseCookieHeader(cookieHeader)
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(c, name, value, options as any)
        })
      },
    },
  })
}

export const authMiddleware = async (c: Context, next: Next) => {
  const supabase = createSupabaseClient(c)
  
  // Refresh session if needed and get the user
  const { data: { user } } = await supabase.auth.getUser()
  
  c.set('user', user)
  c.set('supabase', supabase)
  
  await next()
}

export const requireAuth = async (c: Context, next: Next) => {
  const user = c.get('user')
  
  if (!user) {
    return c.redirect('/login')
  }
  
  await next()
}
