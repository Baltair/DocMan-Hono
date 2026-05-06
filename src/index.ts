import { Hono } from 'hono'
import { authMiddleware } from './middleware/auth'
import { authRouter } from './routes/auth'
import { pagesRouter } from './routes/pages'

const app = new Hono()

// Mount routers
app.route('/api/auth', authRouter)

// Apply auth middleware only to page routes
app.use('*', authMiddleware)
app.route('/', pagesRouter)

export default app
