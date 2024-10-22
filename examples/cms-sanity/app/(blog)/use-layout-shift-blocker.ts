"use client";

import { startTransition, useCallback, useEffect, useReducer } from "react";
import { flushSync } from "react-dom";
import isEqual from "react-fast-compare";
import { useEffectEvent } from "use-effect-event";

type State = {
  // children: React.ReactNode;
  // dependencies: unknown[];
  fallback: React.ReactNode;
  children: React.ReactNode;
  dependencies: unknown[];
  state: "passthrough" | "suspended" | "transitioning";
  // state: "unblocked" | "blocked";
  // now: number;
};

type Action =
  | {
      type: "backup";
      payload: React.ReactNode;
    }
  // | { type: "snapshot children"; payload: { children: React.ReactNode } }
  // | { type: "snapshot dependencies"; payload: { dependencies: unknown[] } }
  // | { type: "block"; payload: { dependencies: unknown[] } }
  | { type: "suspend"; payload: unknown[] }
  | { type: "start transition"; payload: React.ReactNode }
  | { type: "end transition" };

function reducer(state: State, action: Action): State {
  console.log("reducer", { state, action });
  // First check if we need to block an update
  // if (action.type === "update" && state.state === "unblocked") {
  //   // We need to transition to a blocked state
  //   if (!isEqual(state.dependencies, action.payload.dependencies)) {
  //     return {
  //       ...state,
  //       state: "blocked" as const,
  //       pendingDependencies: action.payload.dependencies,
  //       pendingChildren: state.children,
  //     };
  //   }
  //   // We stay unblocked, but we need to snapshot the children if it's changed
  //   if (!Object.is(state.children, action.payload.children)) {
  //     return { ...state, children: action.payload.children };
  //   }
  // }

  switch (action.type) {
    case "backup":
      return Object.is(state.fallback, action.payload)
        ? state
        : { ...state, fallback: action.payload };

    case "suspend":
      return state.state === "suspended" &&
        isEqual(state.dependencies, action.payload)
        ? state
        : { ...state, state: "suspended", dependencies: action.payload };

    case "start transition":
      return state.state === "transitioning"
        ? state
        : { ...state, state: "transitioning", children: action.payload };

    case "end transition":
      return state.state === "passthrough"
        ? state
        : { ...state, state: "passthrough" };

    // case "update":
    //   return isEqual(
    //     // Update pending state, if needed
    //     [state.pendingChildren, state.pendingDependencies],
    //     [action.payload.children, action.payload.dependencies],
    //   )
    //     ? state
    //     : {
    //         ...state,
    //         pendingChildren: action.payload.children,
    //         pendingDependencies: action.payload.dependencies,
    //       };

    // case "snapshot children":
    //   return state.state === "blocked"
    //     ? isEqual(state.pendingChildren, action.payload.children)
    //       ? state
    //       : { ...state, pendingChildren: action.payload.children }
    //     : isEqual(state.children, action.payload.children)
    //       ? state
    //       : { ...state, children: action.payload.children };
    // case "snapshot dependencies":
    //   return state.state === "blocked"
    //     ? isEqual(state.pendingDependencies, action.payload.dependencies)
    //       ? state
    //       : { ...state, pendingDependencies: action.payload.dependencies }
    //     : isEqual(state.dependencies, action.payload.dependencies)
    //       ? state
    //       : {
    //           ...state,
    //           state: "blocked" as const,
    //           pendingDependencies: action.payload.dependencies,
    //         };
    // case "block":
    //   return state.state === "blocked" &&
    //     isEqual(state.pendingDependencies, action.payload.dependencies)
    //     ? state
    //     : {
    //         ...state,
    //         state: "blocked" as const,
    //         pendingDependencies: action.payload.dependencies,
    //       };
    // case "resume":
    //   return state.state === "unblocked"
    //     ? state
    //     : {
    //         ...state,
    //         state: "unblocked" as const,
    //         children: state.fallback,
    //         dependencies: state.dependencies,
    //       };
    // case "resumed":
    //   return state.state === "resuming"
    //     ? {
    //         ...state,
    //         state: "unblocked",
    //         children: state.pendingChildren,
    //         dependencies: state.pendingDependencies,
    //         now: Date.now(),
    //       }
    //     : state;
    default:
      return state;
  }
}

function init({
  children,
  dependencies,
}: {
  children: React.ReactNode;
  dependencies: unknown[];
}): State {
  return {
    fallback: children,
    children: null,
    dependencies: dependencies,
    state: "passthrough" as const,
    // now: Date.now(),
  };
}

export function useLayoutShiftBlocker(
  children: React.ReactNode,
  dependencies: unknown[],
) {
  const [state, dispatch] = useReducer(
    reducer,
    { children, dependencies },
    init,
  );

  // Suspend if dependencies have changed, keep updating deps while suspended
  if (!isEqual(state.dependencies, dependencies)) {
    dispatch({ type: "suspend", payload: dependencies });
  }

  useEffect(() => {
    // Skip if transitioning
    if (state.state === "transitioning") return;

    // Suspend if dependencies have changed, keep updating deps while suspended
    if (!isEqual(state.dependencies, dependencies)) {
      dispatch({ type: "suspend", payload: dependencies });
      return;
    }

    // Only backup the fallback if we're passthrough
    if (state.state === "passthrough") {
      dispatch({ type: "backup", payload: children });
    }
  }, [children, dependencies, state.dependencies, state.state]);

  // // const isResuming = state.state === "resuming";
  // useEffect(() => {
  //   if (isResuming) return;

  //   if (isEqual(state.dependencies, dependencies)) {
  //   }
  //   startTransition(() =>
  //     dispatch({ type: "update", payload: { children, dependencies } }),
  //   );
  // }, []);

  // const handleViewTransition = useEffectEvent(() => {

  // });
  const startViewTransition = useCallback(() => {
    const update = () =>
      dispatch({ type: "start transition", payload: children });
    const finish = () => dispatch({ type: "end transition" });
    if (
      "startViewTransition" in document &&
      typeof document.startViewTransition === "function"
    ) {
      console.log("startViewTransition");
      document
        .startViewTransition(() => flushSync(() => update()))
        .finished.then(finish);
    } else {
      startTransition(() => finish());
    }
  }, [children]);

  // const scheduleViewTransition = useCallback(() => {
  //   dispatch({ type: "start transition" });
  // }, []);

  // useEffect(() => {
  //   if (state.state !== "transitioning") return;

  //   const raf = requestAnimationFrame(() => {
  //     const update = () => dispatch({ type: "end transition" });
  //     if (
  //       "startViewTransition" in document &&
  //       typeof document.startViewTransition === "function"
  //     ) {
  //       console.log("startViewTransition");
  //       document.startViewTransition(flushSync(() => update()));
  //     } else {
  //       startTransition(() => update());
  //     }
  //   });
  //   return () => cancelAnimationFrame(raf);
  // }, [state.state]);

  return [
    {
      children:
        state.state === "passthrough"
          ? children
          : state.state === "transitioning"
            ? state.children
            : state.fallback,
      state: state.state,
    },
    startViewTransition,
  ] as const;
}
