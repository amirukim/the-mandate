import { useCallback, useEffect, useState } from "react";

/** Reveals text a couple of characters at a time; instant under reduced motion. */
export function useTypewriter(text: string, enabled: boolean) {
  const [count, setCount] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    setCount(enabled ? 0 : text.length);
    if (!enabled || !text) return;
    const timer = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(timer);
          return c;
        }
        return c + 2;
      });
    }, 24);
    return () => window.clearInterval(timer);
  }, [text, enabled]);
  const done = count >= text.length;
  const complete = useCallback(() => setCount(text.length), [text.length]);
  return { shown: text.slice(0, count), done, complete };
}

/** Shared entrance/exit timing for the beat panels. */
export const stageFade = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] as const },
});
