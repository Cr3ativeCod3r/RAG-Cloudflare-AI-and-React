// worker/src/index.js
// Cloudflare Worker - RAG chatbot API for Astra Beauty Salon

import { handleChat } from "./handlers/chat.js";
import { handleSeed } from "./handlers/seed.js";
import { corsHeaders } from "./utils/cors.js";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: corsHeaders }
      );
    }

    const url = new URL(request.url);

    try {
      switch (url.pathname) {
        case "/chat":
          return await handleChat(request, env, corsHeaders);
        case "/seed":
          return await handleSeed(request, env, corsHeaders);
        default:
          return Response.json(
            { error: "Not found" },
            { status: 404, headers: corsHeaders }
          );
      }
    } catch (error) {
      console.error("Unhandled error:", error);
      return Response.json(
        { error: "Internal server error: " + error.message },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
