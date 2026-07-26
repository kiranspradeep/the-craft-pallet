import "dotenv/config";
import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function main(): Promise<void> {
  console.log("🌱 Seeding admin users...");

  const superAdminEmail = process.env.SEED_SUPERADMIN_EMAIL || "superadmin@craftpallet.com";
  const superAdminPassword = process.env.SEED_SUPERADMIN_PASSWORD || "SuperAdmin@123";

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@craftpallet.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  // ── SUPERADMIN ──────────────────────────────────────────────────────────
  const existingSuperAdmin = await prisma.adminUser.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const superAdminHash = await bcrypt.hash(superAdminPassword, BCRYPT_ROUNDS);
    await prisma.adminUser.create({
      data: {
        name: "Super Admin",
        email: superAdminEmail,
        passwordHash: superAdminHash,
        role: AdminRole.SUPERADMIN,
        isActive: true,
      },
    });
    console.log(`✅ SUPERADMIN created: ${superAdminEmail}`);
  } else {
    console.log(`⏭️  SUPERADMIN already exists: ${superAdminEmail}`);
  }

  // ── ADMIN ────────────────────────────────────────────────────────────────
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
    await prisma.adminUser.create({
      data: {
        name: "Admin",
        email: adminEmail,
        passwordHash: adminHash,
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });
    console.log(`✅ ADMIN created: ${adminEmail}`);
  } else {
    console.log(`⏭️  ADMIN already exists: ${adminEmail}`);
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });