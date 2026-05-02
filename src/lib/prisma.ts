/* eslint-disable @typescript-eslint/no-explicit-any */
declare const globalThis: any

let _prisma: any = null

function getPrisma() {
  if (_prisma) return _prisma
  const { PrismaClient } = require('@prisma/client')
  const { PrismaPg } = require('@prisma/adapter-pg')
  const { Pool } = require('pg')

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)

  _prisma = globalThis.__prisma || new PrismaClient({ adapter, log: ['error'] })
  if (process.env.NODE_ENV !== 'production') globalThis.__prisma = _prisma
  return _prisma
}

export const prisma: any = new Proxy({}, {
  get(_t, prop) { return getPrisma()[prop] }
})
