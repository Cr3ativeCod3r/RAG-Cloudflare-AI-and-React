// scripts/parse-docx.mjs
// Jednorazowy skrypt do wyciągnięcia tekstu z zabiegi.docx i podziału na fragmenty (chunks)
import mammoth from "mammoth";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const docxPath = resolve(projectRoot, "zabiegi.docx");
const outputDir = resolve(projectRoot, "data");
const outputPath = resolve(outputDir, "zabiegi-chunks.json");

// Upewnij się, że folder data istnieje
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`📄 Czytam: ${docxPath}`);
const result = await mammoth.extractRawText({ path: docxPath });
const text = result.value;

console.log(`📝 Wyodrębniony tekst: ${text.length} znaków`);

// Dzielimy tekst na fragmenty ~300 znaków z nakładaniem 50 znaków
function chunkText(text, chunkSize = 300, overlap = 50) {
  const chunks = [];
  // Najpierw spróbuj podzielić po akapitach
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 10);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `chunk-${chunks.length}`,
        text: currentChunk.trim(),
      });
      // Overlap: zachowaj ostatnie 50 znaków
      currentChunk = currentChunk.slice(-overlap) + "\n" + paragraph;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + paragraph;
    }
  }

  // Ostatni fragment
  if (currentChunk.trim().length > 20) {
    chunks.push({
      id: `chunk-${chunks.length}`,
      text: currentChunk.trim(),
    });
  }

  // Jeśli akapity nie zadziałały, fallback na podział po znakach
  if (chunks.length === 0) {
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end).trim();
      if (chunk.length > 20) {
        chunks.push({
          id: `chunk-${chunks.length}`,
          text: chunk,
        });
      }
      start = end - overlap;
    }
  }

  return chunks;
}

const chunks = chunkText(text);

writeFileSync(outputPath, JSON.stringify(chunks, null, 2), "utf-8");

console.log(`\n✅ Wyodrębniono ${chunks.length} fragmentów z zabiegi.docx`);
console.log(`📁 Zapisano do: ${outputPath}`);
console.log(`\nPierwsze 3 fragmenty (podgląd):`);
chunks.slice(0, 3).forEach((c, i) => {
  console.log(`\n--- Fragment ${i} (${c.text.length} znaków) ---`);
  console.log(c.text.substring(0, 150) + (c.text.length > 150 ? "..." : ""));
});
