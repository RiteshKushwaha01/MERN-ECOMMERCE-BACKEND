import nodeMailer from 'nodemailer'

export const sendEmail = async ({ email, subject, message }) => {
  // Validate SMTP configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP configuration is missing. Please check your environment variables.')
  }

  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  // Verify transporter configuration
  try {
    await transporter.verify()
  } catch (error) {
    throw new Error(`SMTP connection failed: ${error.message}`)
  }

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  }
  
  await transporter.sendMail(mailOptions)
}
