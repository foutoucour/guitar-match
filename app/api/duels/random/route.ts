import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { selectRandomPair } from "@/lib/duel";
import { GuitarCategory } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const excludeParam = searchParams.get("exclude");
  const categoryParam = searchParams.get("category") as GuitarCategory | null;
  const sessionId =
    request.headers.get("x-session-id") ?? crypto.randomUUID();

  const excludeIds = excludeParam ? excludeParam.split(",") : [];

  const guitars = await prisma.guitar.findMany({
    where: {
      isActive: true,
      ...(categoryParam ? { category: categoryParam } : {}),
    },
  });

  const result = selectRandomPair(
    guitars,
    excludeIds,
    categoryParam ?? undefined
  );

  if (!result) {
    return NextResponse.json(
      { error: "insufficient_guitars" },
      { status: 503 }
    );
  }

  const duel = await prisma.duel.create({
    data: {
      guitar1Id: result.guitar1.id,
      guitar2Id: result.guitar2.id,
      category: result.category,
      sessionId,
    },
  });

  return NextResponse.json({
    duel: {
      id: duel.id,
      guitar1: result.guitar1,
      guitar2: result.guitar2,
    },
  });
}
