export type GuitarCategory = "ELECTRIC" | "ACOUSTIC" | "BASS" | "OTHER";

export type ReactionType =
  | "CHOIX_IMPOSSIBLE"
  | "TROP_FACILE"
  | "JE_CONNAIS_PAS"
  | "JE_POSSEDE_UNE"
  | "JAI_JOUE_LES_DEUX";

export interface Guitar {
  id: string;
  brand: string;
  model: string;
  yearRange: string;
  category: GuitarCategory;
  imageUrl: string;
  eloScore: number;
  totalDuels: number;
  isActive: boolean;
}

export interface Duel {
  id: string;
  guitar1: Guitar;
  guitar2: Guitar;
  winnerId: string | null;
  category: GuitarCategory;
  sessionId: string;
  createdAt: string;
}

export interface DuelResponse {
  duel: {
    id: string;
    guitar1: Guitar;
    guitar2: Guitar;
  };
}

export interface VoteResponse {
  vote: { id: string };
  guitar1: { id: string; eloScore: number };
  guitar2: { id: string; eloScore: number };
}
