import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'

config({ path: path.join(__dirname, '.env') })

// Use DIRECT_URL (port 5432) for all schema operations — pooler (6543) hangs
const DIRECT_URL = process.env.DIRECT_URL!

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: DIRECT_URL,
  },
  migrate: {
    async adapter() {
      const pool = new Pool({ connectionString: DIRECT_URL })
      return new PrismaPg(pool)
    },
  },
})
