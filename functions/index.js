/* eslint-env node */
/**
 * Firebase Functions v2 + Express
 * API: POST /submitMessage   { name, email, message }
 */

const express = require("express");
const cors = require("cors");
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");

// Global configuration for region and resource control
setGlobalOptions({
  maxInstances: 10,
  region: "australia-southeast1",
  timeoutSeconds: 60,
  memory: "256MiB",
});

const app = express();
app.use(cors({origin: true}));
app.use(express.json()); // parse incoming JSON

// Health check
app.get("/", (_req, res) => res.status(200).send("api ok"));

/**
 * Email format validation
 * @param {string} s
 * @return {boolean}
 */
function isValidEmail(s = "") {
  return /^\S+@\S+\.\S+$/.test(String(s));
}

// Preflight (some browsers)
app.options("/submitMessage", (_req, res) => res.sendStatus(204));

// POST /submitMessage
app.post("/submitMessage", (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  // 1) Validate fields
  if (name.length < 2) {
    logger.warn("Invalid name", {name});
    return res.status(400).json({status: "error", error: "Invalid name"});
  }
  if (!isValidEmail(email)) {
    logger.warn("Invalid email", {email});
    return res.status(400).json({status: "error", error: "Invalid email"});
  }
  if (message.length < 5) {
    logger.warn("Message too short");
    return res.status(400).json({status: "error", error: "Message too short"});
  }

  // 2) Logging (server-side) - satisfies BR E.1
  logger.info("📨 New contact message received", {
    name,
    email,
    message: message.slice(0, 2000),
  });

  // 3) Response
  return res.status(200).json({
    status: "ok",
    received: {
      name,
      email,
    },
  });
});

// Export to Firebase Cloud Functions
exports.api = onRequest(app);
