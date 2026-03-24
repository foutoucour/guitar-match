"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Guitar, DuelResponse, VoteResponse, ReactionType } from "@/types";

type Phase = "loading" | "ready" | "voted" | "reacting" | "error";

interface DuelState {
  id: string;
  guitar1: Guitar;
  guitar2: Guitar;
}

interface EloResult {
  guitar1Elo: number;
  guitar2Elo: number;
}

export function useRandomDuel() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reaction, setReaction] = useState<ReactionType | null>(null);
  const [eloResult, setEloResult] = useState<EloResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prefetchedRef = useRef<DuelState | null>(null);
  const sessionIdRef = useRef<string>("");

  // Initialise sessionId from sessionStorage
  useEffect(() => {
    let sid = sessionStorage.getItem("guitar-match-session-id");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("guitar-match-session-id", sid);
    }
    sessionIdRef.current = sid;
  }, []);

  const getHistory = (): string[] => {
    try {
      return JSON.parse(
        sessionStorage.getItem("guitar-match-duel-history") ?? "[]"
      );
    } catch {
      return [];
    }
  };

  const addToHistory = (g1: string, g2: string) => {
    const history = getHistory();
    // keep last 10 pairs = 20 IDs
    const next = [...history, g1, g2].slice(-20);
    sessionStorage.setItem("guitar-match-duel-history", JSON.stringify(next));
  };

  const fetchDuel = useCallback(async (): Promise<DuelState> => {
    const history = getHistory();
    const exclude = history.join(",");
    const url = `/api/duels/random${exclude ? `?exclude=${exclude}` : ""}`;
    const res = await fetch(url, {
      headers: { "x-session-id": sessionIdRef.current },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: DuelResponse = await res.json();
    return data.duel as DuelState;
  }, []);

  const loadDuel = useCallback(async () => {
    setPhase("loading");
    setSelectedId(null);
    setReaction(null);
    setEloResult(null);
    setError(null);
    try {
      const data = await fetchDuel();
      setDuel(data);
      setPhase("ready");
      // Start prefetching next duel in background
      fetchDuel()
        .then((next) => {
          prefetchedRef.current = next;
        })
        .catch(() => {
          // Prefetch failure is non-critical
        });
    } catch {
      setError("Impossible de charger le duel");
      setPhase("error");
    }
  }, [fetchDuel]);

  // Load on mount
  useEffect(() => {
    loadDuel();
  }, [loadDuel]);

  const vote = useCallback(
    async (guitarId: string) => {
      if (!duel || selectedId) return;
      // Optimistic update — transition immediately
      setSelectedId(guitarId);
      setPhase("voted");
      addToHistory(duel.guitar1.id, duel.guitar2.id);

      try {
        const res = await fetch("/api/votes", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            duelId: duel.id,
            winnerId: guitarId,
            sessionId: sessionIdRef.current,
            reaction: null,
          }),
        });
        if (res.ok) {
          const data: VoteResponse = await res.json();
          setEloResult({
            guitar1Elo: data.guitar1.eloScore,
            guitar2Elo: data.guitar2.eloScore,
          });
        }
      } catch {
        // Optimistic update already shown — ignore background error silently
      }
    },
    [duel, selectedId]
  );

  const selectReaction = useCallback(async (r: ReactionType) => {
    setReaction(r);
    setPhase("reacting");
  }, []);

  const next = useCallback(() => {
    if (prefetchedRef.current) {
      setDuel(prefetchedRef.current);
      prefetchedRef.current = null;
      setSelectedId(null);
      setReaction(null);
      setEloResult(null);
      setPhase("ready");
      // Prefetch the next duel in background
      fetchDuel()
        .then((n) => {
          prefetchedRef.current = n;
        })
        .catch(() => {
          // Prefetch failure is non-critical
        });
    } else {
      loadDuel();
    }
  }, [fetchDuel, loadDuel]);

  return {
    phase,
    duel,
    selectedId,
    reaction,
    eloResult,
    error,
    vote,
    selectReaction,
    next,
    retry: loadDuel,
  };
}
