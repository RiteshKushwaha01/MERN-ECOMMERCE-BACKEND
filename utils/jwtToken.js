import jwt from 'jsonwebtoken'

console.log('JWT SECRET:', process.env.JWT_SECRET || process.env.JWT_SECRET_KEY)

export const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

  // Cookie settings for CORS compatibility
  // In development, use lax sameSite
  // In production with HTTPS, use none with secure
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  }

  // For development (HTTP)
  if (process.env.NODE_ENV !== 'production') {
    cookieOptions.sameSite = 'lax'
    cookieOptions.secure = false
  } else {
    // For production (HTTPS)
    cookieOptions.sameSite = 'none'
    cookieOptions.secure = true
  }

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    user,
    message,
    token,
  })
}
