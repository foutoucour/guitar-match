import { Guitar } from "@/types";

export interface GuitarCardProps {
  guitar: Guitar;
  isSelected: boolean;
  isWinner: boolean;
  showElo: boolean;
  onClick: () => void;
}

// Contract stub — full implementation in T-006
export default function GuitarCard(_props: GuitarCardProps): React.ReactElement {
  return <div />;
}
