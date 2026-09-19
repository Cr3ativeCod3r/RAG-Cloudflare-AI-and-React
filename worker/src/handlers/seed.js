// src/handlers/seed.js

/**
 * POST /seed — Jednorazowe zasilenie bazy wektorowej fragmentami z zabiegi.docx
 * Body: { "chunks": [{ "id": "chunk-0", "text": "..." }, ...] }
 * Response: { "success": true, "inserted": N }
 */
export async function handleSeed(request, env, corsHeaders) {
  const { chunks } = await request.json();

  if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
    return Response.json(
      { error: "Wymagana niepusta tablica 'chunks'" },
      { status: 400, headers: corsHeaders }
    );
  }

  const batchSize = 50; // Mniejsze partie, żeby nie przekroczyć limitów API
  let totalInserted = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.text);

    console.log(
      `📊 Przetwarzam partię ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} (${texts.length} fragmentów)`
    );

    // Generuj embeddingi dla partii
    const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: texts,
    });

    // Przygotuj wektory do wstawienia
    const vectors = batch.map((chunk, idx) => ({
      id: chunk.id,
      values: embeddingResponse.data[idx],
      metadata: { text: chunk.text },
    }));

    // Wstaw do Vectorize
    await env.VECTORIZE.upsert(vectors);
    totalInserted += vectors.length;
  }

  return Response.json(
    {
      success: true,
      inserted: totalInserted,
      message: `Zasilono bazę ${totalInserted} fragmentami z zabiegi.docx`,
    },
    { headers: corsHeaders }
  );
}
