"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import isEqual from "react-fast-compare";
import { useSetFinishViewTransition } from "./next-live-transitions/transition-context";

export function useViewTransition(
  children: React.ReactNode,
  dependencies: unknown[],
) {
  const finishViewTransition = useSetFinishViewTransition();
  const [pending, setPending] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [currentDependencies, setCurrentDependencies] = useState(dependencies);
  // const { startViewTransition: startViewTransitionReact } =
  //   useViewTransitionReact();

  useEffect(() => {
    if (!pending) {
      if (isEqual(currentDependencies, dependencies)) {
        if (currentChildren !== children) {
          setCurrentChildren(children);
        }
      } else {
        setCurrentDependencies(dependencies);
        setPending(true);
      }
    }
  }, [children, currentChildren, currentDependencies, dependencies, pending]);

  const startViewTransition = useCallback(() => {
    const update = () => {
      setCurrentDependencies(dependencies);
      setPending(false);
    };
    // startViewTransitionReact(() => update());
    if (
      "startViewTransition" in document &&
      typeof document.startViewTransition === "function"
    ) {
      // document.startViewTransition(flushSync(() => update()));
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            startTransition(() => {
              update();
              finishViewTransition(() => resolve);
            });
          }),
      );
    } else {
      startTransition(() => update());
    }
  }, [dependencies, finishViewTransition]);

  return [
    pending ? currentChildren : children,
    pending,
    startViewTransition,
  ] as const;
}
