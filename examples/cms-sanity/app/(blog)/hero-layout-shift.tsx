"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useDeferredLayoutShift } from "./use-deferred-transition";

/**
 * Suspends layout shift for the hero post when a new post is published.
 * On changes it'll require opt-in form the user before the post is shown.
 * If the post itself is edited, it'll refresh automatically to allow fixing typos.
 */

export function HeroLayoutShift(props: {
  children: React.ReactNode;
  id: string;
}) {
  const [children, pending, startViewTransition] = useDeferredLayoutShift(
    props.children,
    [props.id],
  );

  /**
   * We need to suspend layout shift for user opt-in.
   */
  useEffect(() => {
    if (!pending) return;

    toast("A new post is available", {
      id: "hero-layout-shift",
      duration: Infinity,
      action: {
        label: "Refresh",
        onClick: () => {
          requestAnimationFrame(() =>
            document
              .querySelector("article")
              ?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
          );
          startViewTransition();
        },
      },
    });
  }, [pending, startViewTransition]);

  return children;
}
