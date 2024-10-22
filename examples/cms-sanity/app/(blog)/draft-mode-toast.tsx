"use client";

import { useDraftModeEnvironment } from "next-sanity/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { disableDraftMode } from "./actions";

export default function AlertBanner() {
  const env = useDraftModeEnvironment();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (
      env === "checking" ||
      env === "presentation-iframe" ||
      env === "presentation-window"
    ) {
      return;
    }

    const toastId = toast("Draft Mode Enabled", {
      description:
        env === "live"
          ? "Content is live, refreshing automatically"
          : "Refresh manually to see changes",
      duration: Infinity,
      action: {
        label: "Disable",
        onClick: () =>
          startTransition(async () => {
            await disableDraftMode();
            startTransition(() => router.refresh());
          }),
      },
    });
    return () => {
      toast.dismiss(toastId);
    };
  }, [env, router]);

  useEffect(() => {
    if (pending) {
      const toastId = toast.loading("Disabling draft mode...");
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [pending]);

  return null;
}
