import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";
import Avatar3D from "./Avatar3D";
import type { Message } from "./types";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
}

export function ChatWindow({ messages, isLoading, input, setInput, sendMessage }: ChatWindowProps) {
  return (
    <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[650px] max-h-[calc(100vh-8rem)] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in">
      <div className="h-[180px] shrink-0 border-b border-gray-100 relative">
        <Avatar3D isLoading={isLoading} />
      </div>
      <Header />
      <MessageList messages={messages} isLoading={isLoading} />
      <InputArea input={input} setInput={setInput} sendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
