import { createUserTable } from '../models/userTable.js'
import { createOrderItemTable } from '../models/orderItemTable.js'
import { createOrdersTable } from '../models/ordersTable.js'
import { createPaymentsTable } from '../models/paymentsTable.js'
import { createProductReviewsTable } from '../models/productReviewsTable.js'
import { createProductsTable } from '../models/productTable.js'
import { createShippingInfoTable } from '../models/shippingInfoTable.js'

export const createTables = async () => {
  try {
    // console.log('Starting table creation...')
    // await createUserTable()
    // console.log('✓ Users table created')
    // await createProductsTable()
    // console.log('✓ Products table created')
    // await createProductReviewsTable()
    // console.log('✓ Product Reviews table created')
    // await createOrdersTable()
    // console.log('✓ Orders table created')
    // await createOrderItemTable()
    // console.log('✓ Order Items table created')
    // await createShippingInfoTable()
    // console.log('✓ Shipping Info table created')
    // await createPaymentsTable()
    // console.log('✓ Payments table created')
    console.log('All Tables Created Successfully.')
  } catch (error) {
    console.error('Error creating tables:', error)
    throw error
  }
}
