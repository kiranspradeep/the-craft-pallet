// optimize-hero.js
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve path to the hero image in client/public/images
const inputPath = path.resolve(__dirname, "client/public/images/hero-banner.png");
const outputWebp = path.resolve(__dirname, "client/public/images/hero-banner.webp");

async function optimizeHero() {
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found at: ${inputPath}`);
    console.log("Make sure you run this from your project root directory.");
    return;
  }

  const initialStats = fs.statSync(inputPath);
  const initialSizeMb = (initialStats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🖼️  Original Image Size: ${initialSizeMb} MB (${initialStats.size.toLocaleString()} bytes)`);
  console.log("⏳ Processing & optimizing...");

  const pipeline = sharp(inputPath);
  const metadata = await pipeline.metadata();

  // If wider than 2560px (2K display), scale down proportionally without stretching
  let processor = pipeline.rotate();
  if (metadata.width && metadata.width > 2560) {
    processor = processor.resize({ width: 2560, withoutEnlargement: true });
  }

  // 1. Generate WebP (Ultra-crisp quality 88 with full chroma subsampling)
  await processor
    .webp({
      quality: 88,          // Visually lossless threshold for web
      effort: 6,           // Maximum compression effort algorithm
      smartSubsample: true // Keeps fine edges and saturated colors sharp
    })
    .toFile(outputWebp);

  const newStats = fs.statSync(outputWebp);
  const newSizeKb = (newStats.size / 1024).toFixed(1);
  const savings = (((initialStats.size - newStats.size) / initialStats.size) * 100).toFixed(1);

  console.log(`\n✅ Done!`);
  console.log(`👉 Created: client/public/images/hero-banner.webp`);
  console.log(`📦 New Size: ${newSizeKb} KB (${savings}% reduction)`);
  console.log(`🚀 High clarity preserved with near-instant page load!\n`);
}

optimizeHero().catch(console.error);