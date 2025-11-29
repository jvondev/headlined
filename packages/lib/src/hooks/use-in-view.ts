
"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

type UseInViewOptions = IntersectionObserverInit & {
  onChange?: (inView: boolean) => void;
  triggerOnce?: boolean;
};

export function useInView({ triggerOnce = false, ...options }: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<Element | null>(null);
  const onChangeRef = useRef(options?.onChange);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Keep the onChange callback fresh
  useEffect(() => {
    onChangeRef.current = options?.onChange;
  }, [options?.onChange]);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const newInView = entry.isIntersecting;
        setInView(newInView);
        if (onChangeRef.current) {
          onChangeRef.current(newInView);
        }
        if (triggerOnce && newInView && observerRef.current) {
            observerRef.current.disconnect();
        }
      },
      options
    );

    observer.observe(currentRef);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [options, triggerOnce, ref]);

  const setRef = useCallback((node: Element | null) => {
    ref.current = node;
  }, []);

  return { ref: setRef, inView };
}
