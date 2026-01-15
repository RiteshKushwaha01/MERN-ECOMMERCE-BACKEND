import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import { errorMiddleware } from './middlewares/errorMiddlewares.js'
import authRouter from './routes/authRoutes.js'
import productRouter from './routes/productRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import Stripe from 'stripe'
import database from './database/db.js'

const app = express()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/* ---------------- CORS ---------------- */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

/* ---------------- STRIPE WEBHOOK ---------------- */

const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    try {
      const paymentIntent = event.data.object
      const { rows } = await database.query(
        `UPDATE payments SET payment_status='Paid' WHERE payment_intent_id=$1 RETURNING *`,
        [paymentIntent.client_secret]
      )

      const orderId = rows[0].order_id
      await database.query(`UPDATE orders SET paid_at=NOW() WHERE id=$1`, [
        orderId,
      ])
    } catch (error) {
      return res.status(500).send('Webhook DB update failed')
    }
  }

  res.status(200).json({ received: true })
}

app.post(
  '/api/v1/payment/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler
)

/* ---------------- MIDDLEWARES ---------------- */

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp',
  })
)

/* ---------------- ROUTES ---------------- */

app.get('/', (req, res) => {
  res.send('BuySphere API is running 🚀')
})

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true })
})

app.get('/api/v1/payment/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_FRONTEND_KEY || '',
  })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/product', productRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/order', orderRouter)

app.use(errorMiddleware)

export default app
