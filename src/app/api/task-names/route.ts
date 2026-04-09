import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const projectId = searchParams.get("projectId");

  const where: Record<string, unknown> = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (projectId) where.projectId = projectId;

  const taskNames = await prisma.taskName.findMany({
    where,
    orderBy: { lastUsedAt: "desc" },
    take: 10,
    include: { project: true },
  });

  return NextResponse.json(taskNames);
}
