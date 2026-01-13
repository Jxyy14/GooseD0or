import { useState, useEffect } from "react";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("goosedoor-bookmarks");
    if (stored) {
      setBookmarks(JSON.parse(stored));
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("goosedoor-bookmarks", JSON.stringify(bookmarks));
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
    if (bookmarks.includes(offerId)) {
      removeBookmark(offerId);
    } else {
      addBookmark(offerId);
    }
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

