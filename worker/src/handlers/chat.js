// src/handlers/chat.js

/**
 * POST /chat - Main RAG chatbot endpoint
 * Body: { "question": "..." }
 * Response: Server-Sent Events (SSE) stream
 */
export async function handleChat(request, env, corsHeaders) {
  const { question } = await request.json();

  if (!question || question.trim().length === 0) {
    return Response.json(
      { error: "Pytanie jest wymagane" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Environment variables with fallback to default values
  const embeddingModel = env.EMBEDDING_MODEL || "@cf/baai/bge-base-en-v1.5";
  const chatModel = env.CHAT_MODEL || "@cf/meta/llama-3.1-8b-instruct-fp8";
  const topK = parseInt(env.RAG_TOP_K || "3");
  const maxTokens = parseInt(env.CHAT_MAX_TOKENS || "1024");
  const temperature = parseFloat(env.CHAT_TEMPERATURE || "0.1");

  // 1. Generate an embedding for the user's question
  const embeddingResponse = await env.AI.run(embeddingModel, {
    text: [question],
  });
  const queryVector = embeddingResponse.data[0];

  // 2. Search for the most similar chunks in Vectorize
  const searchResults = await env.VECTORIZE.query(queryVector, {
    topK: topK, // Variable from env
    returnMetadata: "all",
  });

  // 3. Build context from the results
  const context = searchResults.matches
    .map((match) => match.metadata?.text || "")
    .filter(Boolean)
    .join("\n\n---\n\n");

  // 4. Generate LLM response with RAG context
  const systemPrompt = `Jesteś asystentką salonu kosmetycznego "Astra Beauty". Odpowiadaj po polsku, krótko i przyjaźnie.

BEZWZGLĘDNE ZASADY (NIGDY ich nie łam):

1. JEDYNE ŹRÓDŁO PRAWDY to KONTEKST poniżej. Każda informacja w Twojej odpowiedzi (nazwa zabiegu, cena, czas, opis, pracownik, adres) MUSI być dosłownie zapisana w KONTEKŚCIE.
2. NIGDY nie wymyślaj, nie zgaduj, nie dopowiadaj informacji, których NIE MA w KONTEKŚCIE. Nawet jeśli "wydaje Ci się" że coś wiesz — jeśli tego nie ma w KONTEKŚCIE, to tego NIE WIESZ.
3. Jeśli pytanie dotyczy czegoś, czego NIE MA w KONTEKŚCIE (np. pracownicy, lokalizacja, godziny otwarcia, zabiegi niewymienione w kontekście), odpowiedz DOKŁADNIE: "Nie mam informacji na ten temat. Zapraszam do kontaktu telefonicznego pod numerem +48 123 456 789 lub na naszego Instagrama — chętnie odpowiemy na wszystkie pytania! 😊"
4. Jeśli pytanie jest niezwiązane z salonem kosmetycznym lub nieodpowiednie, odpowiedz: "Jestem asystentką salonu Astra Beauty i mogę pomóc wyłącznie w kwestiach dotyczących naszych zabiegów i usług. 😊"
5. Formatowanie: używaj punktatorów od nowej linii i **pogrubień** dla nazw zabiegów. Podawaj ceny i czasy TYLKO jeśli są w KONTEKŚCIE.

KONTEKST:
${context || "Brak danych."}`;

  const stream = await env.AI.run(chatModel, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    max_tokens: maxTokens,
    temperature: temperature,
    stream: true,
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
