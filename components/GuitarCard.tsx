"use client";

import Image from "next/image";
import { Guitar } from "@/types";

export interface GuitarCardProps {
  guitar: Guitar;
  isSelected: boolean;
  isWinner: boolean;
  showElo: boolean;
  onClick: () => void;
}

export default function GuitarCard({
  guitar,
  isSelected,
  isWinner,
  showElo,
  onClick,
}: GuitarCardProps) {
  const handleClick = () => {
    if (!isSelected) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Vote for ${guitar.brand} ${guitar.model}`}
      aria-pressed={isSelected}
      className={[
        "relative flex flex-col rounded-xl overflow-hidden transition-all duration-200",
        "min-w-[140px] w-full bg-white shadow-md text-left",
        "border-2",
        isSelected
          ? "border-blue-500 ring-4 ring-blue-300 scale-[1.02] cursor-default"
          : "border-transparent hover:border-gray-200 hover:shadow-lg cursor-pointer",
      ].join(" ")}
    >
      {/* Photo — 4:3 aspect ratio */}
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        <Image
          src={guitar.imageUrl}
          alt={`${guitar.brand} ${guitar.model}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 300px"
        />
        {/* Winner badge */}
        {isWinner && (
          <div
            aria-label="Winner"
            className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow"
          >
            ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-0.5">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {guitar.brand}
        </p>
        <p className="text-sm font-semibold text-gray-900 leading-tight">
          {guitar.model}
        </p>
        <p className="text-xs text-gray-400">{guitar.yearRange}</p>
        {showElo && (
          <p className="text-xs font-mono text-blue-600 mt-1">
            ELO {guitar.eloScore}
          </p>
        )}
      </div>
    </button>
  );
}
