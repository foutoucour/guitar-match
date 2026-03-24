import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateElo } from "@/lib/elo";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { duelId, winnerId, sessionId, reaction } = body;

  if (!duelId || !winnerId || !sessionId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const duel = await prisma.duel.findUnique({
    where: { id: duelId },
    include: { guitar1: true, guitar2: true },
  });

  if (!duel) {
    return NextResponse.json({ error: "duel_not_found" }, { status: 404 });
  }

  const isGuitar1 = duel.guitar1Id === winnerId;
  const isGuitar2 = duel.guitar2Id === winnerId;
  if (!isGuitar1 && !isGuitar2) {
    return NextResponse.json({ error: "invalid_winner" }, { status: 400 });
  }

  const loserId = isGuitar1 ? duel.guitar2Id : duel.guitar1Id;
  const winner = isGuitar1 ? duel.guitar1 : duel.guitar2;
  const loser = isGuitar1 ? duel.guitar2 : duel.guitar1;

  const { newWinnerElo, newLoserElo } = calculateElo(winner.eloScore, loser.eloScore);

  try {
    const [vote] = await prisma.$transaction([
      prisma.vote.create({
        data: { duelId, sessionId, reaction: reaction ?? null },
      }),
      prisma.guitar.update({
        where: { id: winnerId },
        data: { eloScore: newWinnerElo, totalDuels: { increment: 1 } },
      }),
      prisma.guitar.update({
        where: { id: loserId },
        data: { eloScore: newLoserElo, totalDuels: { increment: 1 } },
      }),
      prisma.duel.update({
        where: { id: duelId },
        data: { winnerId },
      }),
    ]);

    return NextResponse.json(
      {
        vote: { id: vote.id },
        guitar1: { id: duel.guitar1Id, eloScore: isGuitar1 ? newWinnerElo : newLoserElo },
        guitar2: { id: duel.guitar2Id, eloScore: isGuitar2 ? newWinnerElo : newLoserElo },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "already_voted" }, { status: 409 });
    }
    throw error;
  }
}
