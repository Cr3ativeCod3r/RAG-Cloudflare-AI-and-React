import { useState } from "react";
import { ToggleButton } from "./ToggleButton";
import { ChatWindow } from "./ChatWindow";
import type { Message } from "./types";

const WORKER_URL = "https://astra-chat-api.banaszekk123.workers.dev";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Cześć! 💆‍♀️ Jestem asystentką Astra Beauty. Zapytaj mnie o nasze zabiegi, ceny lub dostępność!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" }
    ]);
    setIsLoading(true);

    try {
      const res = await fetch(`${WORKER_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!res.ok) throw new Error("API Error");

      setIsLoading(false); 

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullAssistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.response) {
                  fullAssistantMessage += data.response;
                  
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = fullAssistantMessage;
                    return newMessages;
                  });
                }
              } catch (e) {
                // ignoruj
              }
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = 
          "Przepraszam, wystąpił błąd. Spróbuj ponownie lub zadzwoń: +48 123 456 789";
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && (
        <ChatWindow 
          messages={messages} 
          isLoading={isLoading} 
          input={input} 
          setInput={setInput} 
          sendMessage={sendMessage} 
        />
      )}
    </>
  );
}
