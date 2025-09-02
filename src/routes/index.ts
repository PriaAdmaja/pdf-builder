import { Hono } from 'hono'
import { logger } from 'hono/logger'
import pdfExample from './example.js'

export const routes = (app: Hono) => {
  app.use('*', logger())

  // custom middleware example
  // app.get('/', hello(), c => c.json({ 1: 'Hello', 2: 'World' }))

  app.get('/health', c =>
    c.json({
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date(),
    }, 200),
  )

  app.route('/example', pdfExample)
}