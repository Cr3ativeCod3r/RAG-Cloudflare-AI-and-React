// src/handlers/seed.js

/**
 * POST /seed - One-time seeding of the vector database with chunks from zabiegi.docx
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

  const batchSize = parseInt(env.SEED_BATCH_SIZE || "50"); // Smaller batches to avoid exceeding API limits
  const embeddingModel = env.EMBEDDING_MODEL || "@cf/baai/bge-base-en-v1.5";
  let totalInserted = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.text);

    console.log(
      `📊 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} (${texts.length} chunks)`
    );

    // Generate embeddings for the batch
    const embeddingResponse = await env.AI.run(embeddingModel, {
      text: texts,
    });

    // Prepare vectors for insertion
    const vectors = batch.map((chunk, idx) => ({
      id: chunk.id,
      values: embeddingResponse.data[idx],
      metadata: { text: chunk.text },
    }));

    // Insert into Vectorize
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
