import { prisma } from "./src/prisma/client.js";

async function main() {
  const files = await prisma.assetFile.findMany({
    where: { previewPath: null },
    select: { id: true, storedName: true },
  });

  console.log(`Found ${files.length} files with no preview path`);

  for (const file of files) {
    const nameWithoutExt = file.storedName.replace(/\.[^/.]+$/, "");
    const previewPath = `uploads/thumbnails/${nameWithoutExt}_thumb.jpg`;

    await prisma.assetFile.update({
      where: { id: file.id },
      data: { previewPath },
    });

    console.log(`Updated: ${file.storedName} → ${previewPath}`);
  }

  console.log("Done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());