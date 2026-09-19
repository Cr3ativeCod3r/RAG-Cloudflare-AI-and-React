// scripts/seed-vectorize.mjs
// Jednorazowy skrypt do zasilenia Vectorize fragmentami z zabiegi.docx
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// ⚠️ ZMIEŃ na właściwy URL po deployu workera!
const WORKER_URL = "https://astra-chat-api.banaszekk123.workers.dev";

const chunksPath = resolve(projectRoot, "data", "zabiegi-chunks.json");
const chunks = JSON.parse(readFileSync(chunksPath, "utf-8"));

console.log(`📤 Wysyłam ${chunks.length} fragmentów do Vectorize...`);
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
    console.error(`❌ Błąd HTTP ${response.status}: ${errorText}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log("✅ Sukces!", result);
  console.log(`\n🎉 Baza wektorowa zaseedowana ${result.inserted} fragmentami.`);
  console.log("   Możesz teraz testować chatbota!");
} catch (error) {
  console.error("❌ Błąd połączenia:", error.message);
  console.error("\n💡 Sprawdź czy:");
  console.error("   1. Worker jest zdeployowany (cd worker && wrangler deploy)");
  console.error("   2. URL w tym skrypcie jest poprawny");
  console.error("   3. Indeks Vectorize 'astra-zabiegi' istnieje");
  process.exit(1);
}
