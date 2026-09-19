// scripts/parse-docx.mjs
// One-time script to extract text from zabiegi.docx and split it into chunks
import mammoth from "mammoth";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const docxPath = resolve(projectRoot, "zabiegi.docx");
const outputDir = resolve(projectRoot, "data");
const outputPath = resolve(outputDir, "zabiegi-chunks.json");

// Ensure the data folder exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`📄 Reading: ${docxPath}`);
const result = await mammoth.extractRawText({ path: docxPath });
const text = result.value;

console.log(`📝 Extracted text: ${text.length} characters`);

// Split text into chunks of ~300 characters with 50 characters overlap
function chunkText(text, chunkSize = 300, overlap = 50) {
  const chunks = [];
  // Try to split by paragraphs first
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 10);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `chunk-${chunks.length}`,
        text: currentChunk.trim(),
      });
      // Overlap: keep the last 50 characters
      currentChunk = currentChunk.slice(-overlap) + "\n" + paragraph;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + paragraph;
    }
  }

  // Last chunk
  if (currentChunk.trim().length > 20) {
    chunks.push({
      id: `chunk-${chunks.length}`,
      text: currentChunk.trim(),
    });
  }

  // If paragraphs didn't work, fallback to character splitting
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

console.log(`\n✅ Extracted ${chunks.length} chunks from zabiegi.docx`);
console.log(`📁 Saved to: ${outputPath}`);
console.log(`\nFirst 3 chunks (preview):`);
chunks.slice(0, 3).forEach((c, i) => {
  console.log(`\n--- Chunk ${i} (${c.text.length} characters) ---`);
  console.log(c.text.substring(0, 150) + (c.text.length > 150 ? "..." : ""));
});
