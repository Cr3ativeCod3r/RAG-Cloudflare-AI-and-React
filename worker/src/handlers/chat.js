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
  const topK = parseInt(env.RAG_TOP_K || "8");
  const maxTokens = parseInt(env.CHAT_MAX_TOKENS || "1024");
  const temperature = parseFloat(env.CHAT_TEMPERATURE || "0.1");

  // Expand query with synonyms to help the English embedding model with Polish terms
  let searchQuery = question;
  const lowerQ = question.toLowerCase();
  if (lowerQ.includes("krost") || lowerQ.includes("pryszcz") || lowerQ.includes("wągr")) {
    searchQuery += " trądzik zaskórniki oczyszczanie twarzy";
  }
  if (lowerQ.includes("zmarszcz") || lowerQ.includes("starzen")) {
    searchQuery += " odmładzanie lifting anti-aging";
  }

  // 1. Generate an embedding for the user's question
  const embeddingResponse = await env.AI.run(embeddingModel, {
    text: [searchQuery],
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

1. JEDYNE ŹRÓDŁO PRAWDY to KONTEKST. Każda informacja (nazwa zabiegu, cena, czas, adres) MUSI pochodzić z KONTEKSTU.
2. Pytania o problemy skórne (np. krosty, pryszcze, wągry, zmarszczki) SĄ związane z salonem. Traktuj potoczne słowa (np. "krosty", "pryszcze") jako synonimy pojęć z kontekstu (np. "trądzik", "zaskórniki").
3. Jeśli na problem klienta w kontekście jest zabieg (np. na trądzik), zaproponuj go, nawet jeśli klient użył innego słowa.
4. NIGDY nie dopowiadaj usług czy zabiegów, których nie ma w KONTEKŚCIE.
5. Jeśli pytanie dotyczy usług/faktów niezwiązanych z salonem kosmetycznym (np. polityka, gotowanie), odpowiedz: "Jestem asystentką salonu Astra Beauty i mogę pomóc wyłącznie w kwestiach dotyczących naszych zabiegów i usług. 😊"
6. Jeśli klient pyta o coś związanego z salonem, ale nie ma tego w KONTEKŚCIE, odpowiedz DOKŁADNIE: "Nie mam informacji na ten temat. Zapraszam do kontaktu telefonicznego pod numerem +48 123 456 789 lub na naszego Instagrama — chętnie odpowiemy na wszystkie pytania! 😊"

ZASADY FORMATOWANIA:
- Domyślnie wymieniaj zabiegi ZWIĘŹLE: tylko **nazwa**, cena i czas trwania. NIE dodawaj opisów zabiegów, chyba że klient wyraźnie pyta o szczegóły konkretnego zabiegu.
- Używaj punktatorów od nowej linii i **pogrubień** dla nazw zabiegów.
- Wymieniaj WSZYSTKIE pasujące zabiegi z kontekstu, nie skracaj listy.

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
