"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDeploymentStatusAction } from "@/lib/actions";

const ACTIVE_STATES = new Set(["BUILDING", "INITIALIZING", "QUEUED"]);

export function StatusPoller({
  deploymentId,
  initialState,
}: {
  deploymentId: string;
  initialState: string;
}) {
  const router = useRouter();
  const stateRef = useRef(initialState);

  useEffect(() => {
    if (!ACTIVE_STATES.has(stateRef.current)) return;

    const interval = setInterval(async () => {
      try {
        const { readyState } = await getDeploymentStatusAction(deploymentId);
        if (readyState !== stateRef.current) {
          stateRef.current = readyState;
          router.refresh();
          if (!ACTIVE_STATES.has(readyState)) {
            clearInterval(interval);
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [deploymentId, router]);

  return null;
}
