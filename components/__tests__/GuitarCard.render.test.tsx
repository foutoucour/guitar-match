/** @jest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import GuitarCard from "../GuitarCard";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

const mockGuitar = {
  id: "g1",
  brand: "Fender",
  model: "Telecaster",
  yearRange: "1952-1960",
  category: "ELECTRIC" as const,
  imageUrl: "https://example.com/tele.jpg",
  eloScore: 1542,
  totalDuels: 20,
  isActive: true,
};

const defaultProps = {
  guitar: mockGuitar,
  isSelected: false,
  isWinner: false,
  showElo: false,
  onClick: jest.fn(),
};

describe("GuitarCard — render", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the guitar brand", () => {
    render(<GuitarCard {...defaultProps} />);
    expect(screen.getByText("Fender")).toBeInTheDocument();
  });

  it("renders the guitar model", () => {
    render(<GuitarCard {...defaultProps} />);
    expect(screen.getByText("Telecaster")).toBeInTheDocument();
  });

  it("renders the year range", () => {
    render(<GuitarCard {...defaultProps} />);
    expect(screen.getByText("1952-1960")).toBeInTheDocument();
  });

  it("renders the guitar image with correct alt text", () => {
    render(<GuitarCard {...defaultProps} />);
    const img = screen.getByAltText("Fender Telecaster");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/tele.jpg");
  });

  it("does not show ELO score when showElo is false", () => {
    render(<GuitarCard {...defaultProps} showElo={false} />);
    expect(screen.queryByText(/ELO 1542/)).not.toBeInTheDocument();
  });

  it("shows ELO score when showElo is true", () => {
    render(<GuitarCard {...defaultProps} showElo={true} />);
    expect(screen.getByText("ELO 1542")).toBeInTheDocument();
  });

  it("does not show winner badge when isWinner is false", () => {
    render(<GuitarCard {...defaultProps} isWinner={false} />);
    expect(screen.queryByLabelText("Winner")).not.toBeInTheDocument();
  });

  it("shows winner badge when isWinner is true", () => {
    render(<GuitarCard {...defaultProps} isWinner={true} />);
    expect(screen.getByLabelText("Winner")).toBeInTheDocument();
  });

  it("calls onClick when clicked and isSelected is false", () => {
    const onClick = jest.fn();
    render(<GuitarCard {...defaultProps} isSelected={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when clicked and isSelected is true", () => {
    const onClick = jest.fn();
    render(<GuitarCard {...defaultProps} isSelected={true} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has aria-label containing brand and model", () => {
    render(<GuitarCard {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "Vote for Fender Telecaster" })
    ).toBeInTheDocument();
  });

  it("has aria-pressed true when isSelected is true", () => {
    render(<GuitarCard {...defaultProps} isSelected={true} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("has aria-pressed false when isSelected is false", () => {
    render(<GuitarCard {...defaultProps} isSelected={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });
});
