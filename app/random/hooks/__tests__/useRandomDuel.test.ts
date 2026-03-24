/** @jest-environment jsdom */
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRandomDuel } from "../useRandomDuel";

// jsdom does not implement crypto.randomUUID — polyfill it
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => "test-uuid-1234",
  },
  configurable: true,
});

const mockGuitar1 = {
  id: "g1",
  brand: "Fender",
  model: "Telecaster",
  yearRange: "1952",
  category: "ELECTRIC" as const,
  imageUrl: "https://example.com/1.jpg",
  eloScore: 1500,
  totalDuels: 0,
  isActive: true,
};

const mockGuitar2 = {
  id: "g2",
  brand: "Gibson",
  model: "Les Paul",
  yearRange: "1959",
  category: "ELECTRIC" as const,
  imageUrl: "https://example.com/2.jpg",
  eloScore: 1500,
  totalDuels: 0,
  isActive: true,
};

const mockDuel = {
  id: "duel-1",
  guitar1: mockGuitar1,
  guitar2: mockGuitar2,
};

const mockVoteResponse = {
  vote: { id: "vote-1" },
  guitar1: { id: "g1", eloScore: 1516 },
  guitar2: { id: "g2", eloScore: 1484 },
};

function makeFetchOk(body: unknown): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(body),
  });
}

beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
});

describe("useRandomDuel", () => {
  describe("initial state", () => {
    it("phase is loading immediately on mount", () => {
      // Provide a fetch that never resolves so the hook stays in loading
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useRandomDuel());

      expect(result.current.phase).toBe("loading");
    });
  });

  describe("successful fetch", () => {
    it("transitions to ready after successful fetch and sets duel", async () => {
      // First call: loadDuel — returns duel. Second call: prefetch — also returns duel.
      global.fetch = makeFetchOk({ duel: mockDuel });

      const { result } = renderHook(() => useRandomDuel());

      await waitFor(() => expect(result.current.phase).toBe("ready"));

      expect(result.current.duel).toEqual(mockDuel);
      expect(result.current.selectedId).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe("fetch failure", () => {
    it("transitions to error when fetch rejects", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useRandomDuel());

      await waitFor(() => expect(result.current.phase).toBe("error"));

      expect(result.current.error).toBe("Impossible de charger le duel");
    });
  });

  describe("vote()", () => {
    it("transitions to voted state optimistically with the selected guitar id", async () => {
      // loadDuel fetch + prefetch fetch
      global.fetch = makeFetchOk({ duel: mockDuel });

      const { result } = renderHook(() => useRandomDuel());
      await waitFor(() => expect(result.current.phase).toBe("ready"));

      // Now set up fetch so that the vote POST call resolves
      global.fetch = makeFetchOk(mockVoteResponse);

      await act(async () => {
        result.current.vote("g1");
      });

      expect(result.current.phase).toBe("voted");
      expect(result.current.selectedId).toBe("g1");
    });

    it("is a no-op when a guitar is already selected", async () => {
      global.fetch = makeFetchOk({ duel: mockDuel });

      const { result } = renderHook(() => useRandomDuel());
      await waitFor(() => expect(result.current.phase).toBe("ready"));

      global.fetch = makeFetchOk(mockVoteResponse);

      await act(async () => {
        result.current.vote("g1");
      });

      const firstSelectedId = result.current.selectedId;

      await act(async () => {
        result.current.vote("g2");
      });

      // selectedId must not change
      expect(result.current.selectedId).toBe(firstSelectedId);
      expect(result.current.selectedId).toBe("g1");
    });
  });

  describe("selectReaction()", () => {
    it("transitions to reacting state and stores the reaction", async () => {
      global.fetch = makeFetchOk({ duel: mockDuel });

      const { result } = renderHook(() => useRandomDuel());
      await waitFor(() => expect(result.current.phase).toBe("ready"));

      // Vote first so selectReaction can be called
      global.fetch = makeFetchOk(mockVoteResponse);
      await act(async () => {
        result.current.vote("g1");
      });

      await act(async () => {
        result.current.selectReaction("TROP_FACILE");
      });

      expect(result.current.phase).toBe("reacting");
      expect(result.current.reaction).toBe("TROP_FACILE");
    });
  });

  describe("next()", () => {
    it("re-enters loading state when no prefetched duel is available", async () => {
      // Use a controlled mock that resolves only the first call so prefetch fails
      global.fetch = jest
        .fn()
        // First call: loadDuel resolves
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ duel: mockDuel }),
        })
        // Second call: prefetch rejects (non-critical)
        .mockRejectedValueOnce(new Error("Prefetch failed"))
        // Third call: vote POST resolves
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockVoteResponse),
        })
        // Fourth call: next() triggers loadDuel which never resolves (to observe loading state)
        .mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useRandomDuel());
      await waitFor(() => expect(result.current.phase).toBe("ready"));

      // Vote to enable next()
      await act(async () => {
        result.current.vote("g1");
      });
      expect(result.current.phase).toBe("voted");

      // next() — prefetchedRef is null because prefetch failed
      act(() => {
        result.current.next();
      });

      expect(result.current.phase).toBe("loading");
    });
  });

  describe("sessionStorage", () => {
    it("persists a session id to sessionStorage on mount", async () => {
      global.fetch = makeFetchOk({ duel: mockDuel });

      renderHook(() => useRandomDuel());

      await waitFor(() => {
        expect(
          sessionStorage.getItem("guitar-match-session-id")
        ).not.toBeNull();
      });
    });

    it("reuses an existing session id from sessionStorage", async () => {
      const existingId = "existing-session-id";
      sessionStorage.setItem("guitar-match-session-id", existingId);

      global.fetch = makeFetchOk({ duel: mockDuel });

      renderHook(() => useRandomDuel());

      await waitFor(() => {
        expect(sessionStorage.getItem("guitar-match-session-id")).toBe(
          existingId
        );
      });
    });

    it("updates duel history in sessionStorage after a vote", async () => {
      global.fetch = makeFetchOk({ duel: mockDuel });

      const { result } = renderHook(() => useRandomDuel());
      await waitFor(() => expect(result.current.phase).toBe("ready"));

      global.fetch = makeFetchOk(mockVoteResponse);

      await act(async () => {
        result.current.vote("g1");
      });

      const history = JSON.parse(
        sessionStorage.getItem("guitar-match-duel-history") ?? "[]"
      );
      expect(history).toContain("g1");
      expect(history).toContain("g2");
    });
  });
});
