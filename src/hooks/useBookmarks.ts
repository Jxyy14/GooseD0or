import { useState, useEffect, useRef } from "react";

export function useBookmarks() {
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

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    bookmarkCount: bookmarks.length,
  };
}
