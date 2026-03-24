import { Guitar, GuitarCategory } from "@/types";

export interface SelectRandomPairResult {
  guitar1: Guitar;
  guitar2: Guitar;
  category: GuitarCategory;
}

/**
 * Selects a random pair of guitars from the provided list.
 *
 * @param guitars - Pool of guitars to select from (all assumed active)
 * @param excludeIds - Flat list of guitar IDs to treat as "recently seen pairs".
 *   A pair is skipped only if BOTH of its guitar IDs appear in this list.
 * @param category - Optional category filter; if omitted, picks any category
 *   that has at least 2 guitars.
 * @returns The selected pair and their shared category, or null if < 2 guitars
 *   are available after filtering.
 */
export function selectRandomPair(
  guitars: Guitar[],
  excludeIds: string[] = [],
  category?: GuitarCategory
): SelectRandomPairResult | null {
  const excludeSet = new Set(excludeIds);

  // When a specific category is requested, filter to it.
  // When none is requested, pick a random category that has at least 2 guitars.
  let pool: Guitar[];
  let resolvedCategory: GuitarCategory;

  if (category) {
    pool = guitars.filter((g) => g.category === category);
    resolvedCategory = category;
  } else {
    // Group by category and keep only categories with >= 2 guitars
    const byCategory = new Map<GuitarCategory, Guitar[]>();
    for (const g of guitars) {
      const list = byCategory.get(g.category) ?? [];
      list.push(g);
      byCategory.set(g.category, list);
    }
    const eligible = Array.from(byCategory.entries()).filter(
      ([, list]) => list.length >= 2
    );
    if (eligible.length === 0) {
      return null;
    }
    const [chosenCategory, chosenPool] =
      eligible[Math.floor(Math.random() * eligible.length)];
    pool = chosenPool;
    resolvedCategory = chosenCategory;
  }

  if (pool.length < 2) {
    return null;
  }

  // Build all valid pairs, skipping pairs where both IDs are in the exclude set
  const validIndices: number[] = [];
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i];
      const b = pool[j];
      if (excludeSet.has(a.id) && excludeSet.has(b.id)) {
        continue;
      }
      validIndices.push(i * pool.length + j); // encode pair as single number
    }
  }

  if (validIndices.length === 0) {
    // All pairs excluded — fall back to any pair (prefer not failing silently)
    const i = Math.floor(Math.random() * pool.length);
    let j = Math.floor(Math.random() * (pool.length - 1));
    if (j >= i) j++;
    return {
      guitar1: pool[i],
      guitar2: pool[j],
      category: resolvedCategory,
    };
  }

  const encoded = validIndices[Math.floor(Math.random() * validIndices.length)];
  const i = Math.floor(encoded / pool.length);
  const j = encoded % pool.length;

  return {
    guitar1: pool[i],
    guitar2: pool[j],
    category: resolvedCategory,
  };
}
