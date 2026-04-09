import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 generated client
const { PrismaClient } = await import("../src/generated/prisma/client.ts");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Delete test time entries first (foreign key)
const entries = await prisma.timeEntry.deleteMany({
  where: { project: { name: { startsWith: "PW-Test" } } },
});
console.log(`Deleted ${entries.count} test entries`);

// Delete test projects
const projects = await prisma.project.deleteMany({
  where: { name: { startsWith: "PW-Test" } },
});
console.log(`Deleted ${projects.count} test projects`);

// Delete test task names
const tasks = await prisma.taskName.deleteMany({
  where: { OR: [{ name: { startsWith: "PW-" } }, { name: { startsWith: "Playwright" } }] },
});
console.log(`Deleted ${tasks.count} test task names`);

// Delete Playwright test entries  
const pwEntries = await prisma.timeEntry.deleteMany({
  where: { description: { startsWith: "Playwright" } },
});
console.log(`Deleted ${pwEntries.count} Playwright entries`);

await prisma.$disconnect();
