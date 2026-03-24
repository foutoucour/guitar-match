import { selectRandomPair } from "../duel";
import { Guitar, GuitarCategory } from "@/types";

function makeGuitar(
  id: string,
  category: GuitarCategory,
  overrides: Partial<Guitar> = {}
): Guitar {
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
    ...overrides,
  };
}

const ELECTRIC_GUITARS: Guitar[] = [
  makeGuitar("e1", "ELECTRIC"),
  makeGuitar("e2", "ELECTRIC"),
  makeGuitar("e3", "ELECTRIC"),
];

const ACOUSTIC_GUITARS: Guitar[] = [
  makeGuitar("a1", "ACOUSTIC"),
  makeGuitar("a2", "ACOUSTIC"),
];

const MIXED_GUITARS: Guitar[] = [...ELECTRIC_GUITARS, ...ACOUSTIC_GUITARS];

describe("selectRandomPair", () => {
  describe("same category guarantee", () => {
    it("returns two guitars from the same category when no filter is given", () => {
      // Run multiple times to reduce flakiness probability
      for (let i = 0; i < 20; i++) {
        const result = selectRandomPair(MIXED_GUITARS);
        expect(result).not.toBeNull();
        expect(result!.guitar1.category).toBe(result!.guitar2.category);
      }
    });

    it("returns two guitars of the requested category when category filter is provided", () => {
      for (let i = 0; i < 10; i++) {
        const result = selectRandomPair(MIXED_GUITARS, [], "ELECTRIC");
        expect(result).not.toBeNull();
        expect(result!.guitar1.category).toBe("ELECTRIC");
        expect(result!.guitar2.category).toBe("ELECTRIC");
      }
    });

    it("resolves the category field in the result", () => {
      const result = selectRandomPair(ELECTRIC_GUITARS, [], "ELECTRIC");
      expect(result!.category).toBe("ELECTRIC");
    });
  });

  describe("exclusion logic", () => {
    it("does not return a pair where both IDs are in the exclude list", () => {
      // Exclude e1 and e2 — only valid pair with three guitars is (e1,e3) and (e2,e3)
      // Excluding e1+e2 means pair (e1,e2) is skipped but (e1,e3) and (e2,e3) remain
      const result = selectRandomPair(ELECTRIC_GUITARS, ["e1", "e2"]);
      expect(result).not.toBeNull();
      // The pair (e1, e2) must not be returned
      const ids = [result!.guitar1.id, result!.guitar2.id];
      const bothExcluded = ids.includes("e1") && ids.includes("e2");
      expect(bothExcluded).toBe(false);
    });

    it("returns a pair even when one guitar ID is in the exclude list (only skip if BOTH are excluded)", () => {
      // Only e1 is excluded — pairs (e1,e2) and (e1,e3) are not skipped because
      // only one ID from each pair is in the exclude set
      const results = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const result = selectRandomPair(ELECTRIC_GUITARS, ["e1"]);
        expect(result).not.toBeNull();
        results.add(`${result!.guitar1.id}-${result!.guitar2.id}`);
      }
      // With 3 guitars and only e1 excluded (not both in any pair), all 3 pairs are valid
      expect(results.size).toBeGreaterThan(0);
    });

    it("falls back to any pair when all pairs are excluded", () => {
      // Two guitars: both IDs excluded → all pairs excluded → fallback
      const twoGuitars = [makeGuitar("x1", "ELECTRIC"), makeGuitar("x2", "ELECTRIC")];
      const result = selectRandomPair(twoGuitars, ["x1", "x2"]);
      expect(result).not.toBeNull();
      expect(result!.guitar1.id).not.toBe(result!.guitar2.id);
    });
  });

  describe("503 on insufficient guitars", () => {
    it("returns null when pool is empty", () => {
      expect(selectRandomPair([])).toBeNull();
    });

    it("returns null when only one guitar is in the pool", () => {
      expect(selectRandomPair([makeGuitar("solo", "ELECTRIC")])).toBeNull();
    });

    it("returns null when category filter yields fewer than 2 guitars", () => {
      const onlyOneAcoustic = [
        makeGuitar("a1", "ACOUSTIC"),
        makeGuitar("e1", "ELECTRIC"),
        makeGuitar("e2", "ELECTRIC"),
      ];
      expect(selectRandomPair(onlyOneAcoustic, [], "ACOUSTIC")).toBeNull();
    });

    it("returns null when category filter yields zero guitars", () => {
      expect(selectRandomPair(ELECTRIC_GUITARS, [], "BASS")).toBeNull();
    });
  });

  describe("no self-duel", () => {
    it("guitar1 and guitar2 are always different guitars", () => {
      for (let i = 0; i < 20; i++) {
        const result = selectRandomPair(ELECTRIC_GUITARS);
        expect(result).not.toBeNull();
        expect(result!.guitar1.id).not.toBe(result!.guitar2.id);
      }
    });
  });

  describe("category filter", () => {
    it("returns only BASS guitars when BASS is requested", () => {
      const bassGuitars = [
        makeGuitar("b1", "BASS"),
        makeGuitar("b2", "BASS"),
        makeGuitar("e1", "ELECTRIC"),
      ];
      const result = selectRandomPair(bassGuitars, [], "BASS");
      expect(result).not.toBeNull();
      expect(result!.guitar1.category).toBe("BASS");
      expect(result!.guitar2.category).toBe("BASS");
    });

    it("returns guitars of a consistent category when no filter given and all are same category", () => {
      const result = selectRandomPair(ACOUSTIC_GUITARS);
      expect(result).not.toBeNull();
      expect(result!.guitar1.category).toBe("ACOUSTIC");
      expect(result!.guitar2.category).toBe("ACOUSTIC");
    });
  });
});
