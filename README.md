# Astra Beauty - AI Assistant (PoC)

<img width="1466" height="740" alt="Image" src="https://github.com/user-attachments/assets/def985c8-129b-4fa5-ac9e-526a1f50b23d" />

A Proof of Concept (PoC) for an intelligent, interactive 3D virtual assistant designed for a beauty salon. The assistant answers customer questions regarding treatments, prices, and availability using a custom knowledge base.

## Technologies

**Frontend:**
*   **Astro** & **React** - UI framework and component rendering.
*   **Tailwind CSS** - Styling.
*   **React Three Fiber / Drei** & **Three.js** - Rendering the interactive 3D avatar.

**Backend & AI (Cloudflare Ecosystem):**
*   **Cloudflare Workers** - Serverless backend handling API requests and stream generation.
*   **Cloudflare Vectorize** - Vector database for storing the salon's knowledge base.
*   **Cloudflare AI (Workers AI)**:
    *   `@cf/baai/bge-base-en-v1.5` - Embedding model for text vectorization.
    *   `@cf/meta/llama-3.1-8b-instruct-fp8` - Large Language Model generating conversational responses.

## How the RAG (Retrieval-Augmented Generation) Works

To prevent AI hallucinations and guarantee that the assistant only provides factual information about the salon, we use a strict RAG architecture:

1.  **Query Expansion:** The user's question is intercepted and colloquial terms (e.g., "pimples") are seamlessly expanded into professional medical/salon terms (e.g., "acne", "blackheads") to ensure accurate vector matching.
2.  **Embedding:** The expanded query is converted into a mathematical vector representation.
3.  **Context Retrieval:** We query the Cloudflare Vectorize database to find the most relevant chunks of knowledge (e.g., specific skincare treatments and prices).
4.  **Prompt Injection:** The retrieved facts are injected into a strict system prompt that forbids the LLM from inventing services, prices, or policies not explicitly found in the context.
5.  **Streaming Response:** The LLaMA 3.1 model streams the final answer back to the frontend in real-time, simultaneously triggering subtle "thinking" and "talking" animations on the 3D avatar.
