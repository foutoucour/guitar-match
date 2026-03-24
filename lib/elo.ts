const DEFAULT_K_FACTOR = 32;

function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateElo(
  winnerElo: number,
  loserElo: number,
  kFactor: number = DEFAULT_K_FACTOR
): { newWinnerElo: number; newLoserElo: number } {
  const winnerExpected = expectedScore(winnerElo, loserElo);
  const loserExpected = expectedScore(loserElo, winnerElo);

  return {
    newWinnerElo: Math.round(winnerElo + kFactor * (1 - winnerExpected)),
    newLoserElo: Math.round(loserElo + kFactor * (0 - loserExpected)),
  };
}
