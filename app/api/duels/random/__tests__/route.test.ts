import { GET } from "@/app/api/duels/random/route";
import { prisma } from "@/lib/prisma";
import { selectRandomPair } from "@/lib/duel";
import { NextRequest } from "next/server";
import { Guitar, GuitarCategory } from "@/types";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    guitar: { findMany: jest.fn() },
    duel: { create: jest.fn() },
  },
}));

jest.mock("@/lib/duel", () => ({
  selectRandomPair: jest.fn(),
}));

const mockPrisma = prisma as {
  guitar: { findMany: jest.Mock };
  duel: { create: jest.Mock };
};

const mockSelectRandomPair = selectRandomPair as jest.Mock;

function makeRequest(
  url: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(url, { headers });
}

function makeGuitar(id: string, category: GuitarCategory = "ELECTRIC"): Guitar {
  return {
    id,
    brand: "Brand",
    model: "Model",
    yearRange: "2000-2010",
    category,
    imageUrl: `https://example.com/${id}.jpg`,
    eloScore: 1500,
    totalDuels: 0,
    isActive: true,
  };
}

const guitar1 = makeGuitar("guitar-1", "ELECTRIC");
const guitar2 = makeGuitar("guitar-2", "ELECTRIC");

const mockPair = {
  guitar1,
  guitar2,
  category: "ELECTRIC" as GuitarCategory,
};

const mockDuel = {
  id: "duel-1",
  guitar1Id: "guitar-1",
  guitar2Id: "guitar-2",
  category: "ELECTRIC",
  sessionId: "session-abc",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.guitar.findMany.mockResolvedValue([guitar1, guitar2]);
  mockSelectRandomPair.mockReturnValue(mockPair);
  mockPrisma.duel.create.mockResolvedValue(mockDuel);
});

describe("GET /api/duels/random", () => {
  describe("happy path", () => {
    it("returns 200 with duel containing id, guitar1, and guitar2", async () => {
      const req = makeRequest("http://localhost/api/duels/random");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        duel: {
          id: "duel-1",
          guitar1,
          guitar2,
        },
      });
    });

    it("response guitar fields include eloScore and totalDuels", async () => {
      const req = makeRequest("http://localhost/api/duels/random");
      const res = await GET(req);
      const data = await res.json();

      expect(data.duel.guitar1.eloScore).toBe(1500);
      expect(data.duel.guitar1.totalDuels).toBe(0);
      expect(data.duel.guitar2.eloScore).toBe(1500);
      expect(data.duel.guitar2.totalDuels).toBe(0);
    });
  });

  describe("503 on insufficient guitars", () => {
    it("returns 503 with insufficient_guitars error when selectRandomPair returns null", async () => {
      mockSelectRandomPair.mockReturnValue(null);

      const req = makeRequest("http://localhost/api/duels/random");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data).toEqual({ error: "insufficient_guitars" });
    });

    it("does not call prisma.duel.create when selectRandomPair returns null", async () => {
      mockSelectRandomPair.mockReturnValue(null);

      const req = makeRequest("http://localhost/api/duels/random");
      await GET(req);

      expect(mockPrisma.duel.create).not.toHaveBeenCalled();
    });
  });

  describe("exclude query param", () => {
    it("passes exclude ids as array to selectRandomPair when ?exclude is provided", async () => {
      const req = makeRequest(
        "http://localhost/api/duels/random?exclude=id1,id2"
      );
      await GET(req);

      expect(mockSelectRandomPair).toHaveBeenCalledWith(
        expect.anything(),
        ["id1", "id2"],
        undefined
      );
    });

    it("passes empty array to selectRandomPair when no exclude param", async () => {
      const req = makeRequest("http://localhost/api/duels/random");
      await GET(req);

      expect(mockSelectRandomPair).toHaveBeenCalledWith(
        expect.anything(),
        [],
        undefined
      );
    });
  });

  describe("category query param", () => {
    it("passes category filter to prisma.guitar.findMany when ?category=ELECTRIC", async () => {
      const req = makeRequest(
        "http://localhost/api/duels/random?category=ELECTRIC"
      );
      await GET(req);

      expect(mockPrisma.guitar.findMany).toHaveBeenCalledWith({
        where: { isActive: true, category: "ELECTRIC" },
      });
    });

    it("does not pass category key to prisma.guitar.findMany when no ?category", async () => {
      const req = makeRequest("http://localhost/api/duels/random");
      await GET(req);

      expect(mockPrisma.guitar.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it("passes category to selectRandomPair when ?category is provided", async () => {
      const req = makeRequest(
        "http://localhost/api/duels/random?category=ACOUSTIC"
      );
      await GET(req);

      expect(mockSelectRandomPair).toHaveBeenCalledWith(
        expect.anything(),
        [],
        "ACOUSTIC"
      );
    });

    it("passes undefined category to selectRandomPair when no ?category", async () => {
      const req = makeRequest("http://localhost/api/duels/random");
      await GET(req);

      expect(mockSelectRandomPair).toHaveBeenCalledWith(
        expect.anything(),
        [],
        undefined
      );
    });
  });

  describe("session id handling", () => {
    it("uses X-Session-Id header as sessionId in duel.create", async () => {
      const req = makeRequest("http://localhost/api/duels/random", {
        "x-session-id": "test-session",
      });
      await GET(req);

      expect(mockPrisma.duel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ sessionId: "test-session" }),
        })
      );
    });

    it("generates a non-empty sessionId when X-Session-Id header is absent", async () => {
      const req = makeRequest("http://localhost/api/duels/random");
      await GET(req);

      expect(mockPrisma.duel.create).toHaveBeenCalled();
      const createCall = mockPrisma.duel.create.mock.calls[0][0];
      expect(typeof createCall.data.sessionId).toBe("string");
      expect(createCall.data.sessionId.length).toBeGreaterThan(0);
    });
  });

  describe("duel.create arguments", () => {
    it("calls prisma.duel.create with correct guitar ids and category from pair", async () => {
      const req = makeRequest("http://localhost/api/duels/random");
      await GET(req);

      expect(mockPrisma.duel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          guitar1Id: "guitar-1",
          guitar2Id: "guitar-2",
          category: "ELECTRIC",
        }),
      });
    });
  });
});
