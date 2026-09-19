interface ToggleButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ToggleButton({ isOpen, setIsOpen }: ToggleButtonProps) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg shadow-brand-500/25 flex items-center justify-center transition-all duration-300 hover:scale-110"
      aria-label={isOpen ? "Zamknij chatbota" : "Otwórz chatbota"}
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )}
    </button>
  );
}
