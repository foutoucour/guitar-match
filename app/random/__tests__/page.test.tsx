/** @jest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import RandomPage from "../page";

jest.mock("../hooks/useRandomDuel");
jest.mock("@/components/GuitarCard", () => ({
  __esModule: true,
  default: ({ guitar, onClick, isSelected, isWinner, showElo }: any) => (
    <button
      data-testid={`guitar-card-${guitar.id}`}
      data-selected={String(isSelected)}
      data-winner={String(isWinner)}
      data-show-elo={String(showElo)}
      onClick={onClick}
    >
      {guitar.brand} {guitar.model}
    </button>
  ),
}));

import { useRandomDuel } from "../hooks/useRandomDuel";

const mockUseRandomDuel = useRandomDuel as jest.MockedFunction<
  typeof useRandomDuel
>;

const baseGuitar1 = {
  id: "g1",
  brand: "Fender",
  model: "Telecaster",
  yearRange: "1952",
  category: "ELECTRIC" as const,
  imageUrl: "https://x.com/1.jpg",
  eloScore: 1500,
  totalDuels: 0,
  isActive: true,
};

const baseGuitar2 = {
  id: "g2",
  brand: "Gibson",
  model: "Les Paul",
  yearRange: "1959",
  category: "ELECTRIC" as const,
  imageUrl: "https://x.com/2.jpg",
  eloScore: 1500,
  totalDuels: 0,
  isActive: true,
};

const baseDuel = {
  id: "duel-1",
  guitar1: baseGuitar1,
  guitar2: baseGuitar2,
};

const defaultHookReturn = {
  phase: "ready" as const,
  duel: baseDuel,
  selectedId: null,
  reaction: null,
  eloResult: null,
  error: null,
  vote: jest.fn(),
  selectReaction: jest.fn(),
  next: jest.fn(),
  retry: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRandomDuel.mockReturnValue(defaultHookReturn);
});

describe("RandomPage", () => {
  describe("loading state", () => {
    it("shows skeleton elements when phase is loading", () => {
      mockUseRandomDuel.mockReturnValue({
        ...defaultHookReturn,
        phase: "loading",
        duel: null,
      });

      const { container } = render(<RandomPage />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("renders a sr-only loading message for assistive technologies", () => {
      mockUseRandomDuel.mockReturnValue({
        ...defaultHookReturn,
        phase: "loading",
        duel: null,
      });

      render(<RandomPage />);

      expect(screen.getByText("Chargement du duel…")).toBeInTheDocument();
    });
  });

  describe("ready state", () => {
    it("renders both guitar cards", () => {
      render(<RandomPage />);

      expect(screen.getByTestId("guitar-card-g1")).toBeInTheDocument();
      expect(screen.getByTestId("guitar-card-g2")).toBeInTheDocument();
    });

    it("does not show the Suivant button before voting", () => {
      render(<RandomPage />);

      expect(screen.queryByText(/Suivant/)).toBeNull();
    });

    it("calls vote() with guitar id when a card is clicked", () => {
      const voteMock = jest.fn();
      mockUseRandomDuel.mockReturnValue({
        ...defaultHookReturn,
        vote: voteMock,
      });

      render(<RandomPage />);

      fireEvent.click(screen.getByTestId("guitar-card-g1"));

      expect(voteMock).toHaveBeenCalledWith("g1");
    });
  });

  describe("voted state", () => {
    const votedReturn = {
      ...defaultHookReturn,
      phase: "voted" as const,
      selectedId: "g1",
      eloResult: { guitar1Elo: 1516, guitar2Elo: 1484 },
    };

    it("shows ELO scores on both guitar cards (showElo is true)", () => {
      mockUseRandomDuel.mockReturnValue(votedReturn);

      render(<RandomPage />);

      expect(screen.getByTestId("guitar-card-g1")).toHaveAttribute(
        "data-show-elo",
        "true"
      );
      expect(screen.getByTestId("guitar-card-g2")).toHaveAttribute(
        "data-show-elo",
        "true"
      );
    });

    it("renders the Suivant button", () => {
      mockUseRandomDuel.mockReturnValue(votedReturn);

      render(<RandomPage />);

      expect(screen.getByText(/Suivant/)).toBeInTheDocument();
    });

    it("calls next() when Suivant is clicked", () => {
      const nextMock = jest.fn();
      mockUseRandomDuel.mockReturnValue({ ...votedReturn, next: nextMock });

      render(<RandomPage />);

      fireEvent.click(screen.getByText(/Suivant/));

      expect(nextMock).toHaveBeenCalledTimes(1);
    });

    it("renders reaction picker buttons after voting", () => {
      mockUseRandomDuel.mockReturnValue(votedReturn);

      render(<RandomPage />);

      expect(screen.getByText("Trop facile")).toBeInTheDocument();
      expect(screen.getByText("Choix impossible")).toBeInTheDocument();
    });
  });

  describe("reacting state", () => {
    it("highlights the selected reaction with aria-pressed=true", () => {
      mockUseRandomDuel.mockReturnValue({
        ...defaultHookReturn,
        phase: "reacting" as const,
        selectedId: "g1",
        reaction: "TROP_FACILE",
      });

      render(<RandomPage />);

      const reactionButton = screen.getByText("Trop facile");
      expect(reactionButton).toHaveAttribute("aria-pressed", "true");
    });

    it("other reaction buttons have aria-pressed=false", () => {
      mockUseRandomDuel.mockReturnValue({
        ...defaultHookReturn,
        phase: "reacting" as const,
        selectedId: "g1",
        reaction: "TROP_FACILE",
      });

      render(<RandomPage />);

      const otherButton = screen.getByText("Choix impossible");
      expect(otherButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("error state", () => {
    it("shows the error message and Réessayer button", () => {
      mockUseRandomDuel.mockReturnValue({
        ...defaultHookReturn,
        phase: "error" as const,
        duel: null,
        error: "Impossible de charger le duel",
      });

      render(<RandomPage />);

      expect(
        screen.getByText("Impossible de charger le duel")
      ).toBeInTheDocument();
      expect(screen.getByText("Réessayer")).toBeInTheDocument();
    });

    it("calls retry() when Réessayer is clicked", () => {
      const retryMock = jest.fn();
      mockUseRandomDuel.mockReturnValue({
        ...defaultHookReturn,
        phase: "error" as const,
        duel: null,
        error: "Impossible de charger le duel",
        retry: retryMock,
      });

      render(<RandomPage />);

      fireEvent.click(screen.getByText("Réessayer"));

      expect(retryMock).toHaveBeenCalledTimes(1);
    });
  });
});
