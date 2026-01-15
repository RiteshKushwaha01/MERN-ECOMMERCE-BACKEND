import database from '../database/db.js'
import Stripe from 'stripe'
import ErrorHandler from '../middlewares/errorMiddlewares.js'
import { config } from 'dotenv'

config()

function getStripeInstance() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new ErrorHandler(
      'Stripe secret key is not configured. Set STRIPE_SECRET_KEY in environment.',
      500
    )
  }
  return Stripe(key)
}

export async function generatePaymentIntent(orderId, totalPrice) {
  try {
    const stripe = getStripeInstance()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'usd',
      // limit to card payments to avoid showing preview/unactivated methods
      payment_method_types: ['card'],
    })

    await database.query(
      'INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [orderId, 'Online', 'Pending', paymentIntent.client_secret]
    )

    return { success: true, clientSecret: paymentIntent.client_secret }
  } catch (error) {
    console.error('Payment Error:', error)
    return { success: false, message: error.message || 'Payment Failed.' }
  }
}
