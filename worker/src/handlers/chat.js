// src/handlers/chat.js

/**
 * POST /chat — Główny endpoint RAG chatbota
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

  // 1. Wygeneruj embedding pytania użytkownika
  const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
    text: [question],
  });
  const queryVector = embeddingResponse.data[0];

  // 2. Wyszukaj najbardziej podobne fragmenty w Vectorize
  const searchResults = await env.VECTORIZE.query(queryVector, {
    topK: 3, // Mniej chunków = szybsze przetwarzanie przez LLM
    returnMetadata: "all",
  });

  // 3. Zbuduj kontekst z wyników
  const context = searchResults.matches
    .map((match) => match.metadata?.text || "")
    .filter(Boolean)
    .join("\n\n---\n\n");

  // 4. Wygeneruj odpowiedź LLM z kontekstem RAG
  const systemPrompt = `Jesteś miłą i profesjonalną asystentką salonu kosmetycznego "Astra Beauty".

ZASADY:
- Odpowiadaj WYŁĄCZNIE na podstawie podanego KONTEKSTU Z BAZY WIEDZY.
- Jeśli kontekst nie zawiera odpowiedzi na pytanie, powiedz: "Nie mam informacji na ten temat. Zapraszam do kontaktu telefonicznego pod numerem +48 123 456 789 lub na naszego Instagrama — chętnie odpowiemy na wszystkie pytania! 😊"
- Odpowiadaj po polsku, krótko i przyjaźnie.
- Możesz polecać zabiegi i usługi wymienione w kontekście.
- Podawaj ceny i czasy trwania zabiegów, jeśli są dostępne w kontekście.
- Formatuj wypowiedzi czytelnie. Jeśli wymieniasz kilka zabiegów, używaj punktatorów i ZAWSZE stawiaj je od nowej linii. Używaj **pogrubień** do nazw zabiegów.
- Nie wymyślaj informacji, których nie ma w kontekście.
- ABSOLUTNIE ZAKAZANE JEST PISANIE PROCESU MYŚLOWEGO (np. "Analyze the request", "Drafting"). Zwracaj OD RAZU tylko i wyłącznie gotową odpowiedź dla klienta.

KONTEKST Z BAZY WIEDZY:
${context || "Brak danych w bazie wiedzy."}`;

  // Używamy glm-4.7-flash, ze strumieniowaniem (stream: true)
  const stream = await env.AI.run("@cf/zai-org/glm-4.7-flash", {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    max_tokens: 512,
    temperature: 0.3,
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
