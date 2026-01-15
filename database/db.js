import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env')
}

const sql = neon(process.env.DATABASE_URL)

/**
 * Unified database interface
 * Same usage as pg: database.query(sql, params)
 */
const database = {
  query: async (text, params = []) => {
    try {
      return await sql(text, params)
    } catch (error) {
      console.error('Database query error:', error.message)
      throw error
    }
  },
}

console.log('Neon database client initialized')

export default database
