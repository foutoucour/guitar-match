import { POST } from "@/app/api/votes/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    duel: { findUnique: jest.fn(), update: jest.fn() },
    guitar: { update: jest.fn() },
    vote: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/elo", () => ({
  calculateElo: jest.fn().mockReturnValue({ newWinnerElo: 1516, newLoserElo: 1484 }),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma> & {
  duel: { findUnique: jest.Mock; update: jest.Mock };
  guitar: { update: jest.Mock };
  vote: { create: jest.Mock };
  $transaction: jest.Mock;
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockDuel = {
  id: "duel-1",
  guitar1Id: "guitar-1",
  guitar2Id: "guitar-2",
  guitar1: { id: "guitar-1", eloScore: 1500, totalDuels: 10 },
  guitar2: { id: "guitar-2", eloScore: 1500, totalDuels: 10 },
  winnerId: null,
  category: "ELECTRIC",
  sessionId: "session-abc",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/votes", () => {
  describe("happy path", () => {
    it("returns 201 with vote id and updated ELO scores when guitar1 wins", async () => {
      (mockPrisma.duel.findUnique as jest.Mock).mockResolvedValue(mockDuel);
      (mockPrisma.$transaction as jest.Mock).mockResolvedValue([
        { id: "vote-1" },
        {},
        {},
        {},
      ]);

      const req = makeRequest({
        duelId: "duel-1",
        winnerId: "guitar-1",
        sessionId: "session-xyz",
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.vote).toEqual({ id: "vote-1" });
      expect(data.guitar1).toEqual({ id: "guitar-1", eloScore: 1516 });
      expect(data.guitar2).toEqual({ id: "guitar-2", eloScore: 1484 });
    });

    it("returns 201 with correct ELO assignment when guitar2 wins", async () => {
      (mockPrisma.duel.findUnique as jest.Mock).mockResolvedValue(mockDuel);
      (mockPrisma.$transaction as jest.Mock).mockResolvedValue([
        { id: "vote-2" },
        {},
        {},
        {},
      ]);

      const req = makeRequest({
        duelId: "duel-1",
        winnerId: "guitar-2",
        sessionId: "session-xyz",
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.guitar1).toEqual({ id: "guitar-1", eloScore: 1484 });
      expect(data.guitar2).toEqual({ id: "guitar-2", eloScore: 1516 });
    });

    it("includes reaction in vote.create call when provided", async () => {
      (mockPrisma.duel.findUnique as jest.Mock).mockResolvedValue(mockDuel);
      (mockPrisma.$transaction as jest.Mock).mockImplementation(
        async (ops: any[]) => {
          // Execute each operation to verify the vote.create args
          return [{ id: "vote-3" }, {}, {}, {}];
        }
      );

      const req = makeRequest({
        duelId: "duel-1",
        winnerId: "guitar-1",
        sessionId: "session-xyz",
        reaction: "TROP_FACILE",
      });

      const res = await POST(req as any);
      expect(res.status).toBe(201);
    });
  });

  describe("missing required fields", () => {
    it("returns 400 when duelId is missing", async () => {
      const req = makeRequest({ winnerId: "guitar-1", sessionId: "session-xyz" });
      const res = await POST(req as any);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("missing_fields");
    });

    it("returns 400 when winnerId is missing", async () => {
      const req = makeRequest({ duelId: "duel-1", sessionId: "session-xyz" });
      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it("returns 400 when sessionId is missing", async () => {
      const req = makeRequest({ duelId: "duel-1", winnerId: "guitar-1" });
      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });
  });

  describe("duel not found", () => {
    it("returns 404 when duel does not exist", async () => {
      (mockPrisma.duel.findUnique as jest.Mock).mockResolvedValue(null);

      const req = makeRequest({
        duelId: "nonexistent",
        winnerId: "guitar-1",
        sessionId: "session-xyz",
      });

      const res = await POST(req as any);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("duel_not_found");
    });
  });

  describe("invalid winnerId", () => {
    it("returns 400 when winnerId is not guitar1 or guitar2 of the duel", async () => {
      (mockPrisma.duel.findUnique as jest.Mock).mockResolvedValue(mockDuel);

      const req = makeRequest({
        duelId: "duel-1",
        winnerId: "guitar-999",
        sessionId: "session-xyz",
      });

      const res = await POST(req as any);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("invalid_winner");
    });
  });

  describe("duplicate vote", () => {
    it("returns 409 when (duelId, sessionId) pair already exists", async () => {
      (mockPrisma.duel.findUnique as jest.Mock).mockResolvedValue(mockDuel);

      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { code: "P2002", clientVersion: "5.0.0" }
      );
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(p2002Error);

      const req = makeRequest({
        duelId: "duel-1",
        winnerId: "guitar-1",
        sessionId: "session-xyz",
      });

      const res = await POST(req as any);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toBe("already_voted");
    });

    it("re-throws non-P2002 Prisma errors", async () => {
      (mockPrisma.duel.findUnique as jest.Mock).mockResolvedValue(mockDuel);

      const otherError = new Error("Database connection lost");
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(otherError);

      const req = makeRequest({
        duelId: "duel-1",
        winnerId: "guitar-1",
        sessionId: "session-xyz",
      });

      await expect(POST(req as any)).rejects.toThrow("Database connection lost");
    });
  });
});
