// scripts/seed-vectorize.mjs
// One-time script to seed Vectorize with chunks from zabiegi.docx
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// ⚠️ CHANGE to the actual URL after deploying the worker!
const WORKER_URL = "https://astra-chat-api.banaszekk123.workers.dev";

const chunksPath = resolve(projectRoot, "data", "zabiegi-chunks.json");
const chunks = JSON.parse(readFileSync(chunksPath, "utf-8"));

console.log(`📤 Sending ${chunks.length} chunks to Vectorize...`);
console.log(`🔗 Worker URL: ${WORKER_URL}`);
console.log();

try {
  const response = await fetch(`${WORKER_URL}/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chunks }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ HTTP Error ${response.status}: ${errorText}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log("✅ Success!", result);
  console.log(`\n🎉 Vector database seeded with ${result.inserted} chunks.`);
  console.log("   You can now test the chatbot!");
} catch (error) {
  console.error("❌ Connection error:", error.message);
  console.error("\n💡 Check if:");
  console.error("   1. Worker is deployed (cd worker && wrangler deploy)");
  console.error("   2. URL in this script is correct");
  console.error("   3. Vectorize index 'astra-zabiegi' exists");
  process.exit(1);
}
