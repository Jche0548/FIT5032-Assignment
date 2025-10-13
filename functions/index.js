/**
 * Firebase Functions v2 + Express
 * API: POST /submitMessage   { name, email, message }
 */

const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { setGlobalOptions } = require('firebase-functions/v2')
const logger = require('firebase-functions/logger')

// Global configuration for region and resource control
setGlobalOptions({
  maxInstances: 10,
  region: 'australia-southeast1',
  timeoutSeconds: 60,
  memory: '256MiB',
})

const app = express()
app.use(cors({ origin: true })) // allow all origins (adjust as needed)
app.use(express.json())         // parse incoming JSON

// Helper: Email format validation
function isValidEmail(s = '') {
  return /^\S+@\S+\.\S+$/.test(String(s))
}

// POST /submitMessage
app.post('/submitMessage', (req, res) => {
  const { name, email, message } = req.body || {}

  // 1) Validate fields
  if (!name || String(name).trim().length < 2) {
    logger.warn('Invalid name:', name)
    return res.status(400).json({ status: 'error', error: 'Invalid name' })
  }

  if (!email || !isValidEmail(email)) {
    logger.warn('Invalid email:', email)
    return res.status(400).json({ status: 'error', error: 'Invalid email' })
  }

  if (!message || String(message).trim().length < 5) {
    logger.warn('Message too short')
    return res.status(400).json({ status: 'error', error: 'Message too short' })
  }

  // 2) Logging (server-side) - satisfies BR E.1
  logger.info('📨 New contact message received', {
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim().slice(0, 2000),
  })

  // 3) Response
  return res.status(200).json({
    status: 'ok',
    received: {
      name: String(name).trim(),
      email: String(email).trim()
    }
  })
})

// Export to Firebase Cloud Functions
exports.api = onRequest(app)