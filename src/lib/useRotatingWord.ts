"use client";

import { useEffect, useState } from "react";

// Alterna ciclicamente entre as palavras no intervalo dado (ms).
export function useRotatingWord(words: string[], intervalMs = 2500): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  return words[index] ?? "";
}
