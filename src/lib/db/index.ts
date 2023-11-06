import {neon, neonConfig } from '@neondatabase/serverless'
import {drizzle} from 'drizzle-orm/neon-http'
import { error } from 'console'

neonConfig.fetchConnectionCache = true

if (!process.env.DATABASE_URL) {
    throw new Error ("Database not found")
}

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql)

// A Schema, in this case SQL, defines the shape of the db