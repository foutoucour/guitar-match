import { PrismaClient } from "@prisma/client";
import { addGuitar, GuitarInput } from "../scripts/add-guitar";

const prisma = new PrismaClient();

const guitars: GuitarInput[] = [
  // --- ELECTRICS (12) ---
  {
    brand: "Fender",
    model: "Telecaster",
    yearRange: "1950–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Fender-Telecaster/800/600",
  },
  {
    brand: "Fender",
    model: "Stratocaster",
    yearRange: "1954–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Fender-Stratocaster/800/600",
  },
  {
    brand: "Gibson",
    model: "Les Paul Standard",
    yearRange: "1952–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Gibson-LesPaulStandard/800/600",
  },
  {
    brand: "Gibson",
    model: "SG Standard",
    yearRange: "1961–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Gibson-SGStandard/800/600",
  },
  {
    brand: "Gibson",
    model: "ES-335",
    yearRange: "1958–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Gibson-ES335/800/600",
  },
  {
    brand: "PRS",
    model: "Custom 24",
    yearRange: "1985–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/PRS-Custom24/800/600",
  },
  {
    brand: "Gretsch",
    model: "G6120 Nashville",
    yearRange: "1954–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Gretsch-G6120/800/600",
  },
  {
    brand: "Rickenbacker",
    model: "330",
    yearRange: "1958–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Rickenbacker-330/800/600",
  },
  {
    brand: "Epiphone",
    model: "Casino",
    yearRange: "1961–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Epiphone-Casino/800/600",
  },
  {
    brand: "Danelectro",
    model: "59 Original",
    yearRange: "1956–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Danelectro-59/800/600",
  },
  {
    brand: "Reverend",
    model: "Roundhouse",
    yearRange: "2013–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/Reverend-Roundhouse/800/600",
  },
  {
    brand: "G&L",
    model: "ASAT Classic",
    yearRange: "1986–present",
    category: "ELECTRIC",
    imageUrl: "https://picsum.photos/seed/GL-ASATClassic/800/600",
  },

  // --- ACOUSTICS (8) ---
  {
    brand: "Martin",
    model: "D-28",
    yearRange: "1931–present",
    category: "ACOUSTIC",
    imageUrl: "https://picsum.photos/seed/Martin-D28/800/600",
  },
  {
    brand: "Martin",
    model: "000-18",
    yearRange: "1911–present",
    category: "ACOUSTIC",
    imageUrl: "https://picsum.photos/seed/Martin-00018/800/600",
  },
  {
    brand: "Gibson",
    model: "J-45",
    yearRange: "1942–present",
    category: "ACOUSTIC",
    imageUrl: "https://picsum.photos/seed/Gibson-J45/800/600",
  },
  {
    brand: "Gibson",
    model: "J-200",
    yearRange: "1937–present",
    category: "ACOUSTIC",
    imageUrl: "https://picsum.photos/seed/Gibson-J200/800/600",
  },
  {
    brand: "Taylor",
    model: "814ce",
    yearRange: "1994–present",
    category: "ACOUSTIC",
    imageUrl: "https://picsum.photos/seed/Taylor-814ce/800/600",
  },
  {
    brand: "Taylor",
    model: "314ce",
    yearRange: "1994–present",
    category: "ACOUSTIC",
    imageUrl: "https://picsum.photos/seed/Taylor-314ce/800/600",
  },
  {
    brand: "Collings",
    model: "OM2H",
    yearRange: "1990–present",
    category: "ACOUSTIC",
    imageUrl: "https://picsum.photos/seed/Collings-OM2H/800/600",
  },
  {
    brand: "Bourgeois",
    model: "Slope D",
    yearRange: "1995–present",
    category: "ACOUSTIC",
    imageUrl: "https://picsum.photos/seed/Bourgeois-SlopeD/800/600",
  },

  // --- BASSES (7) ---
  {
    brand: "Fender",
    model: "Precision Bass",
    yearRange: "1951–present",
    category: "BASS",
    imageUrl: "https://picsum.photos/seed/Fender-PrecisionBass/800/600",
  },
  {
    brand: "Fender",
    model: "Jazz Bass",
    yearRange: "1960–present",
    category: "BASS",
    imageUrl: "https://picsum.photos/seed/Fender-JazzBass/800/600",
  },
  {
    brand: "Music Man",
    model: "StingRay",
    yearRange: "1976–present",
    category: "BASS",
    imageUrl: "https://picsum.photos/seed/MusicMan-StingRay/800/600",
  },
  {
    brand: "Gibson",
    model: "Thunderbird",
    yearRange: "1963–present",
    category: "BASS",
    imageUrl: "https://picsum.photos/seed/Gibson-Thunderbird/800/600",
  },
  {
    brand: "Rickenbacker",
    model: "4003",
    yearRange: "1979–present",
    category: "BASS",
    imageUrl: "https://picsum.photos/seed/Rickenbacker-4003/800/600",
  },
  {
    brand: "Hofner",
    model: "500/1 Violin Bass",
    yearRange: "1955–present",
    category: "BASS",
    imageUrl: "https://picsum.photos/seed/Hofner-500-1/800/600",
  },
  {
    brand: "G&L",
    model: "L-2000",
    yearRange: "1980–present",
    category: "BASS",
    imageUrl: "https://picsum.photos/seed/GL-L2000/800/600",
  },
];

async function main() {
  console.log("Seeding guitars...");

  for (const guitar of guitars) {
    const existing = await prisma.guitar.findFirst({
      where: { brand: guitar.brand, model: guitar.model },
    });

    if (existing) {
      console.log(`Skipping ${guitar.brand} ${guitar.model} (already exists)`);
      continue;
    }

    const created = await addGuitar(guitar, prisma);
    console.log(`Added: ${created.brand} ${created.model}`);
  }

  const count = await prisma.guitar.count();
  console.log(`Seeding complete. Total guitars in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
