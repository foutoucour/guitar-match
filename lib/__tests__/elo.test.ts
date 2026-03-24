import { calculateElo } from "../elo";

describe("calculateElo", () => {
  describe("equal ELOs (1500 vs 1500)", () => {
    it("winner gains approximately 16 points", () => {
      const { newWinnerElo } = calculateElo(1500, 1500);
      expect(newWinnerElo).toBe(1516);
    });

    it("loser loses approximately 16 points", () => {
      const { newLoserElo } = calculateElo(1500, 1500);
      expect(newLoserElo).toBe(1484);
    });
  });

  describe("strong favourite wins (2000 vs 1000)", () => {
    it("winner gains 0 points because outcome was almost certain (rounds down)", () => {
      const { newWinnerElo } = calculateElo(2000, 1000);
      expect(newWinnerElo).toBe(2000);
    });

    it("loser loses 0 points because outcome was almost certain (rounds down)", () => {
      const { newLoserElo } = calculateElo(2000, 1000);
      expect(newLoserElo).toBe(1000);
    });
  });

  describe("upset: weaker player wins (1000 beats 2000)", () => {
    it("underdog gains 32 points — close to full K-factor because win was very unlikely", () => {
      const { newWinnerElo } = calculateElo(1000, 2000);
      expect(newWinnerElo).toBe(1032);
    });

    it("favourite loses 32 points — close to full K-factor because loss was very unlikely", () => {
      const { newLoserElo } = calculateElo(1000, 2000);
      expect(newLoserElo).toBe(1968);
    });
  });

  describe("custom K-factor", () => {
    it("K=64 produces changes approximately double those of K=32 for equal ELOs", () => {
      const k32 = calculateElo(1500, 1500, 32);
      const k64 = calculateElo(1500, 1500, 64);

      const gainK32 = k32.newWinnerElo - 1500;
      const gainK64 = k64.newWinnerElo - 1500;

      expect(gainK64).toBe(gainK32 * 2);
    });

    it("K=64 with equal ELOs: winner gains 32, loser loses 32", () => {
      const { newWinnerElo, newLoserElo } = calculateElo(1500, 1500, 64);
      expect(newWinnerElo).toBe(1532);
      expect(newLoserElo).toBe(1468);
    });
  });

  describe("zero-sum property", () => {
    it("total ELO is conserved for equal players", () => {
      const winnerElo = 1500;
      const loserElo = 1500;
      const { newWinnerElo, newLoserElo } = calculateElo(winnerElo, loserElo);
      expect(newWinnerElo + newLoserElo).toBe(winnerElo + loserElo);
    });

    it("total ELO is conserved for unequal players (favourite wins)", () => {
      const winnerElo = 2000;
      const loserElo = 1000;
      const { newWinnerElo, newLoserElo } = calculateElo(winnerElo, loserElo);
      expect(newWinnerElo + newLoserElo).toBe(winnerElo + loserElo);
    });

    it("total ELO is conserved for unequal players (upset)", () => {
      const winnerElo = 1000;
      const loserElo = 2000;
      const { newWinnerElo, newLoserElo } = calculateElo(winnerElo, loserElo);
      expect(newWinnerElo + newLoserElo).toBe(winnerElo + loserElo);
    });
  });

  describe("rounding", () => {
    it("newWinnerElo is an integer", () => {
      const { newWinnerElo } = calculateElo(1500, 1500);
      expect(Number.isInteger(newWinnerElo)).toBe(true);
    });

    it("newLoserElo is an integer", () => {
      const { newLoserElo } = calculateElo(1500, 1500);
      expect(Number.isInteger(newLoserElo)).toBe(true);
    });

    it("result values have no decimal part for arbitrary ELOs", () => {
      const { newWinnerElo, newLoserElo } = calculateElo(1423, 1677);
      expect(newWinnerElo % 1).toBe(0);
      expect(newLoserElo % 1).toBe(0);
    });
  });
});
