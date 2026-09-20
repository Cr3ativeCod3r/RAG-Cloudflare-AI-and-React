// src/utils/cors.js

const ALLOWED_ORIGINS = [
  "https://astra-beauty.pages.dev",
];

export function getCorsHeaders(request, env) {
  const origins = env?.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ALLOWED_ORIGINS;

  const origin = request.headers.get("Origin") || "";

  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Allow production origins, or any localhost/127.0.0.1 for local development
  if (
    origins.includes(origin) || 
    origin.startsWith("http://localhost:") || 
    origin.startsWith("http://127.0.0.1:")
  ) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
