import { PrismaClient, GuitarCategory, Guitar } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export interface GuitarInput {
  brand: string;
  model: string;
  yearRange: string;
  category: GuitarCategory;
  imageUrl: string;
}

export async function addGuitar(data: GuitarInput, client: PrismaClient): Promise<Guitar> {
  return client.guitar.create({ data });
}

const prisma = new PrismaClient();

function parseArgs(argv: string[]): {
  brand: string;
  model: string;
  image: string;
  category: GuitarCategory;
  year: string;
} {
  const args = argv.slice(2);

  let brand = "";
  let model = "";
  let image = "";
  let category: GuitarCategory = "OTHER";
  let year = "Unknown";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--brand" && args[i + 1]) {
      brand = args[++i];
    } else if (args[i] === "--model" && args[i + 1]) {
      model = args[++i];
    } else if (args[i] === "--image" && args[i + 1]) {
      image = args[++i];
    } else if (args[i] === "--category" && args[i + 1]) {
      const cat = args[++i].toUpperCase();
      if (!["ELECTRIC", "ACOUSTIC", "BASS", "OTHER"].includes(cat)) {
        console.error(`Invalid category "${cat}". Must be one of: ELECTRIC, ACOUSTIC, BASS, OTHER`);
        process.exit(1);
      }
      category = cat as GuitarCategory;
    } else if (args[i] === "--year" && args[i + 1]) {
      year = args[++i];
    }
  }

  const missing: string[] = [];
  if (!brand) missing.push("--brand");
  if (!model) missing.push("--model");
  if (!image) missing.push("--image");

  if (missing.length > 0) {
    console.error(`Missing required arguments: ${missing.join(", ")}`);
    console.error("");
    console.error("Usage: add-guitar --brand <brand> --model <model> --image <url-or-path> [--category ELECTRIC|ACOUSTIC|BASS|OTHER] [--year <year-range>]");
    console.error('Example: add-guitar --brand "Paul Reed Smith" --model "Custom 24" --image https://example.com/guitar.jpg --category ELECTRIC --year "1985–present"');
    console.error('Example: add-guitar --brand Gibson --model "Les Paul" --image ./guitar.jpg');
    process.exit(1);
  }

  return { brand, model, image, category, year };
}

function resolveImage(image: string): string {
  const isUrl = image.startsWith("http://") || image.startsWith("https://");
  if (isUrl) return image;

  const absolutePath = path.resolve(image);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Local file not found: ${absolutePath}`);
    process.exit(1);
  }

  const publicImagesDir = path.join(__dirname, "..", "public", "images");
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  const filename = path.basename(absolutePath);
  const dest = path.join(publicImagesDir, filename);
  fs.copyFileSync(absolutePath, dest);
  console.log(`Copied image to public/images/${filename}`);

  return `/images/${filename}`;
}

async function main() {
  const { brand, model, image, category, year } = parseArgs(process.argv);
  const imageUrl = resolveImage(image);

  const guitar = await addGuitar(
    { brand, model, yearRange: year, category, imageUrl },
    prisma
  );

  console.log(`Guitar added: ${guitar.brand} ${guitar.model} (${guitar.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
