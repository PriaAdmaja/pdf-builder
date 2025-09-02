import { Hono } from 'hono'
import { logger } from 'hono/logger'
import pdfExample from './example.js'

export const routes = (app: Hono) => {
  app.use('*', logger())

  app.get('/health', c =>
    c.json({
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date(),
    }, 200),
  )

  app.route('/example', pdfExample)
}