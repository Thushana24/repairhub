import { Router } from 'express'
import { prisma } from '../config/prisma'

export const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  })
})

healthRouter.get('/db', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ success: true, data: { database: 'ok' } })
})
