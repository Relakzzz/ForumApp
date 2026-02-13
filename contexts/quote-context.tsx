import React, { createContext, useContext, useState } from 'react';

export interface Quote {
  id: string;
  postId: number;
  authorName: string;
  authorUsername: string;
  selectedText: string;
  timestamp: string;
  topicId: number;
}

interface QuoteContextType {
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  removeQuote: (id: string) => void;
  clearQuotes: () => void;
  updateQuote: (id: string, updatedText: string) => void;
  getQuotesFormatted: () => string;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const addQuote = (quote: Quote) => {
    setQuotes((prev) => [...prev, quote]);
  };

  const removeQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const clearQuotes = () => {
    setQuotes([]);
  };

  const updateQuote = (id: string, updatedText: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selectedText: updatedText } : q))
    );
  };

  const getQuotesFormatted = () => {
    return quotes
      .map(
        (quote) =>
          `[quote="${quote.authorUsername}, post:${quote.postId}, topic:${quote.topicId}"]
${quote.selectedText}
[/quote]`
      )
      .join('\n\n');
  };

  return (
    <QuoteContext.Provider value={{ quotes, addQuote, removeQuote, clearQuotes, updateQuote, getQuotesFormatted }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuotes must be used within QuoteProvider');
  }
  return context;
}
