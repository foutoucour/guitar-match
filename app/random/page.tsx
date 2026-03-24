"use client";

import GuitarCard from "@/components/GuitarCard";
import { useRandomDuel } from "./hooks/useRandomDuel";
import { ReactionType } from "@/types";

const REACTIONS: { value: ReactionType; label: string }[] = [
  { value: "CHOIX_IMPOSSIBLE", label: "Choix impossible" },
  { value: "TROP_FACILE", label: "Trop facile" },
  { value: "JE_CONNAIS_PAS", label: "Je connais pas les deux" },
  { value: "JE_POSSEDE_UNE", label: "Je possède une des deux" },
  { value: "JAI_JOUE_LES_DEUX", label: "J'ai joué les deux" },
];

export default function RandomPage() {
  const {
    phase,
    duel,
    selectedId,
    reaction,
    eloResult,
    error,
    vote,
    selectReaction,
    next,
    retry,
  } = useRandomDuel();

  if (phase === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-4">
        <p role="alert" className="text-red-600 font-medium">
          {error ?? "Erreur de chargement"}
        </p>
        <button
          onClick={retry}
          className="bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Réessayer
        </button>
      </main>
    );
  }

  if (phase === "loading" || !duel) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="sr-only" aria-live="polite">
          Chargement du duel…
        </p>
        <div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-xl"
          aria-hidden="true"
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-xl bg-gray-100 animate-pulse aspect-[3/4]"
            />
          ))}
        </div>
      </main>
    );
  }

  const guitar1Elo = eloResult?.guitar1Elo ?? duel.guitar1.eloScore;
  const guitar2Elo = eloResult?.guitar2Elo ?? duel.guitar2.eloScore;

  const displayGuitar1 = { ...duel.guitar1, eloScore: guitar1Elo };
  const displayGuitar2 = { ...duel.guitar2, eloScore: guitar2Elo };

  const hasVoted = phase === "voted" || phase === "reacting";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="text-2xl font-bold">Laquelle préfères-tu ?</h1>

      {/* Duel cards — stacked on mobile, side by side on sm+ */}
      <div
        className="flex flex-col sm:flex-row gap-4 w-full max-w-xl"
        role="group"
        aria-label="Choisissez une guitare"
      >
        <div className="flex-1">
          <GuitarCard
            guitar={displayGuitar1}
            isSelected={selectedId === duel.guitar1.id}
            isWinner={selectedId === duel.guitar1.id && hasVoted}
            showElo={hasVoted}
            onClick={() => vote(duel.guitar1.id)}
          />
        </div>

        <div
          className="flex items-center justify-center font-bold text-gray-400 text-sm"
          aria-hidden="true"
        >
          VS
        </div>

        <div className="flex-1">
          <GuitarCard
            guitar={displayGuitar2}
            isSelected={selectedId === duel.guitar2.id}
            isWinner={selectedId === duel.guitar2.id && hasVoted}
            showElo={hasVoted}
            onClick={() => vote(duel.guitar2.id)}
          />
        </div>
      </div>

      {/* Post-vote: reaction picker + next button */}
      {hasVoted && (
        <div className="flex flex-col items-center gap-4 w-full max-w-xl">
          <p
            id="reaction-label"
            className="text-sm text-gray-500"
          >
            Réaction (optionnel)
          </p>
          <div
            role="group"
            aria-labelledby="reaction-label"
            className="flex flex-wrap justify-center gap-2"
          >
            {REACTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => selectReaction(r.value)}
                aria-pressed={reaction === r.value}
                className={[
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
                  reaction === r.value
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-500",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={next}
            className="bg-black text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-gray-800 transition-colors w-full sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Suivant →
          </button>
        </div>
      )}
    </main>
  );
}
