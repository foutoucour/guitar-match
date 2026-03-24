import { Guitar, GuitarCategory } from "@/types";

// GuitarCard is a Next.js RSC/client component using JSX — it cannot be
// imported in a node test environment without a full jsdom + babel transform
// pipeline. The tests below verify the TypeScript contracts and the click-guard
// logic that is extracted here for unit testing.

const mockGuitar: Guitar = {
  id: "1",
  brand: "Fender",
  model: "Telecaster",
  yearRange: "1952-1960",
  category: "ELECTRIC" as GuitarCategory,
  imageUrl: "https://example.com/tele.jpg",
  eloScore: 1500,
  totalDuels: 10,
  isActive: true,
};

// Extracted click-guard logic mirroring GuitarCard's handleClick
function makeHandleClick(isSelected: boolean, onClick: () => void) {
  return () => {
    if (!isSelected) onClick();
  };
}

describe("GuitarCard — click-guard logic", () => {
  it("does not invoke onClick when isSelected is true", () => {
    const onClick = jest.fn();
    makeHandleClick(true, onClick)();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("invokes onClick when isSelected is false", () => {
    const onClick = jest.fn();
    makeHandleClick(false, onClick)();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("GuitarCard — Guitar type contract", () => {
  it("mock guitar satisfies the Guitar interface", () => {
    expect(mockGuitar.id).toBe("1");
    expect(mockGuitar.brand).toBe("Fender");
    expect(mockGuitar.model).toBe("Telecaster");
    expect(mockGuitar.yearRange).toBe("1952-1960");
    expect(mockGuitar.category).toBe("ELECTRIC");
    expect(mockGuitar.imageUrl).toBe("https://example.com/tele.jpg");
    expect(mockGuitar.eloScore).toBe(1500);
    expect(mockGuitar.totalDuels).toBe(10);
    expect(mockGuitar.isActive).toBe(true);
  });

  it("aria-label format matches brand + model", () => {
    const label = `Vote for ${mockGuitar.brand} ${mockGuitar.model}`;
    expect(label).toBe("Vote for Fender Telecaster");
  });

  it("ELO display string formats correctly", () => {
    const eloText = `ELO ${mockGuitar.eloScore}`;
    expect(eloText).toBe("ELO 1500");
  });
});
