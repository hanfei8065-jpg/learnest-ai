// app/hooks/useChatStream.ts
"use client";

import { useState, useCallback } from 'react';

export interface ChatMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface UseChatStreamReturn {
  assistantText: string;
  isLoading: boolean;
  requestId: string | null;
  error: string | null;
  send: (messages: ChatMsg[]) => Promise<void>;
  cancel: () => void;
  clearError: () => void;
}

export function useChatStream(): UseChatStreamReturn {
  const [assistantText, setAssistantText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const send = useCallback(async (messages: ChatMsg[]) => {
    setIsLoading(true);
    setError(null);
    setAssistantText('');
    const controller = new AbortController();
    const newRequestId = Math.random().toString(36).substring(2, 9);
    setAbortController(controller);
    setRequestId(newRequestId);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response stream");
      }

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setAssistantText(prev => prev + chunk);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        setError(err.message || 'An error occurred');
        console.error('Streaming error:', err);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
      setRequestId(null);
    }
  }, [abortController]);

  return {
    assistantText,
    isLoading,
    requestId,
    error,
    send,
    cancel,
    clearError,
  };
}