import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

type BookmarkContextType = {
  bookmarks: string[];
  addBookmark: (offerId: string) => void;
  removeBookmark: (offerId: string) => void;
  toggleBookmark: (offerId: string) => void;
  isBookmarked: (offerId: string) => boolean;
  bookmarkCount: number;
};

const BookmarkContext = createContext<BookmarkContextType | null>(null);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("goosedoor-bookmarks");
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch {
        setBookmarks([]);
      }
    }
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem("goosedoor-bookmarks", JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const addBookmark = (offerId: string) => {
    setBookmarks((prev) => {
      if (prev.includes(offerId)) return prev;
      return [...prev, offerId];
    });
  };

  const removeBookmark = (offerId: string) => {
    setBookmarks((prev) => prev.filter((id) => id !== offerId));
  };

  const toggleBookmark = (offerId: string) => {
    setBookmarks((prev) => {
      if (prev.includes(offerId)) {
        return prev.filter((id) => id !== offerId);
      }
      return [...prev, offerId];
    });
  };

  const isBookmarked = (offerId: string) => bookmarks.includes(offerId);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
        bookmarkCount: bookmarks.length,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}

