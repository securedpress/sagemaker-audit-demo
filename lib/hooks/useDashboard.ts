"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardPayload, LoadingState } from "@/types";

interface UseDashboardResult {
  payload: DashboardPayload | null;
  state: LoadingState;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useDashboard(clientId: string): UseDashboardResult {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [state, setState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetch_ = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/summary?clientId=${clientId}`);
      if (res.status === 404) throw new Error("Client not found");
      if (res.status === 403) throw new Error("Contract expired");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const data: DashboardPayload = await res.json();
      setPayload(data);
      setLastFetched(new Date());
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }, [clientId]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { payload, state, error, lastFetched, refresh: fetch_ };
}
