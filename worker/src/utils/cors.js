// src/utils/cors.js

// Allowed origins for CORS - only your production domain and local dev
const ALLOWED_ORIGINS = [
  "https://astra-beauty.pages.dev",
  "http://localhost:4321",
  "http://localhost:3000",
];

/**
 * Returns CORS headers with origin validation.
 * Only whitelisted origins receive the Access-Control-Allow-Origin header.
 */
export function getCorsHeaders(request, env) {
  // Allow overriding via env variable (comma-separated list)
  const origins = env?.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ALLOWED_ORIGINS;

  const origin = request.headers.get("Origin") || "";

  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
