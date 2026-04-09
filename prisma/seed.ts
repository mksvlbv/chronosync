import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { subDays, setHours, setMinutes } from "date-fns";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.taskName.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.project.deleteMany();

  const designSystem = await prisma.project.create({
    data: { name: "Design System", color: "#a855f7", client: "Acme Corp" },
  });

  const marketing = await prisma.project.create({
    data: { name: "Marketing Website", color: "#3b82f6", client: "Internal" },
  });

  const bugFixing = await prisma.project.create({
    data: { name: "Bug Fixing & Maintenance", color: "#f97316", client: null },
  });

  const legacyApp = await prisma.project.create({
    data: { name: "Legacy App Migration", color: "#ef4444", client: "TechStart Inc" },
  });

  const today = new Date();
  const entries = [
    {
      description: "Component Library Updates - Buttons & Inputs",
      projectId: designSystem.id,
      startTime: setMinutes(setHours(today, 9), 0),
      endTime: setMinutes(setHours(today, 11), 15),
    },
    {
      description: "Design Review Prep",
      projectId: designSystem.id,
      startTime: setMinutes(setHours(today, 11), 30),
      endTime: setMinutes(setHours(today, 12), 30),
    },
    {
      description: "Homepage Hero Animation Implementation",
      projectId: marketing.id,
      startTime: setMinutes(setHours(today, 13), 0),
      endTime: setMinutes(setHours(today, 15), 27),
    },
    {
      description: "Mobile Responsive Header Issues",
      projectId: bugFixing.id,
      startTime: setMinutes(setHours(subDays(today, 1), 10), 0),
      endTime: setMinutes(setHours(subDays(today, 1), 11), 45),
    },
    {
      description: "Typography Audit & Scale System",
      projectId: designSystem.id,
      startTime: setMinutes(setHours(subDays(today, 2), 9), 0),
      endTime: setMinutes(setHours(subDays(today, 2), 13), 10),
    },
    {
      description: "Landing Page Copy & CTA Optimization",
      projectId: marketing.id,
      startTime: setMinutes(setHours(subDays(today, 2), 14), 0),
      endTime: setMinutes(setHours(subDays(today, 2), 16), 30),
    },
    {
      description: "Database Schema Migration Script",
      projectId: legacyApp.id,
      startTime: setMinutes(setHours(subDays(today, 3), 9), 30),
      endTime: setMinutes(setHours(subDays(today, 3), 12), 0),
    },
    {
      description: "API Endpoint Testing & Fixes",
      projectId: bugFixing.id,
      startTime: setMinutes(setHours(subDays(today, 3), 13), 0),
      endTime: setMinutes(setHours(subDays(today, 3), 15), 45),
    },
    {
      description: "Color Token Consolidation",
      projectId: designSystem.id,
      startTime: setMinutes(setHours(subDays(today, 4), 10), 0),
      endTime: setMinutes(setHours(subDays(today, 4), 14), 0),
    },
    {
      description: "Newsletter Template",
      projectId: marketing.id,
      startTime: setMinutes(setHours(subDays(today, 5), 9), 0),
      endTime: setMinutes(setHours(subDays(today, 5), 12), 30),
    },
    {
      description: "Form Validation Bugs",
      projectId: bugFixing.id,
      startTime: setMinutes(setHours(subDays(today, 6), 11), 0),
      endTime: setMinutes(setHours(subDays(today, 6), 12), 15),
    },
  ];

  for (const entry of entries) {
    const duration = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000);
    await prisma.timeEntry.create({
      data: { ...entry, duration },
    });

    await prisma.taskName.upsert({
      where: { name_projectId: { name: entry.description, projectId: entry.projectId } },
      update: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
      create: { name: entry.description, projectId: entry.projectId },
    });
  }

  console.log("Seed completed: 4 projects, 11 time entries, 11 task names");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
