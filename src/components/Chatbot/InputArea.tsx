interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
}

export function InputArea({ input, setInput, sendMessage, isLoading }: InputAreaProps) {
  return (
    <div className="p-3 border-t border-gray-100 flex-shrink-0">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Napisz pytanie..."
          className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
        >
          Wyślij
        </button>
      </div>
    </div>
  );
}
