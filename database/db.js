// import { config } from 'dotenv'
// import { neon } from '@neondatabase/serverless'

// config()

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL is missing in .env')
// }

// const sql = neon(process.env.DATABASE_URL)

// /**
//  * Unified database interface
//  * Same usage as pg: database.query(sql, params)
//  */
// const database = {
//   query: async (text, params = []) => {
//     try {
//       return await sql(text, params)
//     } catch (error) {
//       console.error('Database query error:', error.message)
//       throw error
//     }
//   },
// }

// console.log('Neon database client initialized')

// export default database



// import { config } from 'dotenv'
// import { neon } from '@neondatabase/serverless'

// config()

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL is missing in .env')
// }

// const sql = neon(process.env.DATABASE_URL)

// /**
//  * Unified database interface (pg-style)
//  * Use like: database.query("SELECT ... WHERE id = $1", [id])
//  */
// const database = {
//   query: async (text, params = []) => {
//     try {
//       // ✅ IMPORTANT: use sql.query, not sql()
//       return await sql.query(text, params)
//     } catch (error) {
//       console.error('Database query error:', error)
//       throw error
//     }
//   },
// }

// console.log('Neon database client initialized (pg-style queries)')

// export default database



import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env')
}

const sql = neon(process.env.DATABASE_URL)

/**
 * Make Neon behave EXACTLY like pg
 * Always return { rows: [] }
 */
const database = {
  query: async (text, params = []) => {
    try {
      const result = await sql(text, params)

      // 🔑 CRITICAL FIX
      return { rows: result }
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  },
}

console.log('Neon database client initialized')

export default database
