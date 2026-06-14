"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionEvent = Event & {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
};

type RecognitionErrorEvent = Event & { error?: string };

type RecognitionInstance = EventTarget & {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => RecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export function useSpeechRecognition(onFinalText: (text: string) => void) {
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructor) {
      setSupported(false);
      return;
    }

    const recognition = new Constructor();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setInterimText(interim);
      if (final.trim()) onFinalText(final.trim());
    };
    recognition.onerror = (event) => {
      setError(event.error === "not-allowed" ? "Permissão do microfone negada." : "Não foi possível reconhecer sua fala.");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setInterimText("");
    };
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [onFinalText]);

  const toggle = useCallback(() => {
    setError(null);
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognition.abort();
      setListening(false);
    }
  }, [listening]);

  return { supported, listening, interimText, error, toggle };
}
