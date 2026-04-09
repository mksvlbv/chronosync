import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let where: Record<string, unknown> = {};

  if (date) {
    const d = new Date(date);
    where = { startTime: { gte: startOfDay(d), lte: endOfDay(d) } };
  } else if (from && to) {
    where = { startTime: { gte: new Date(from), lte: new Date(to) } };
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: { project: true },
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { description, projectId, startTime, endTime } = body;

  if (!description?.trim() || !projectId) {
    return NextResponse.json({ error: "Description and projectId are required" }, { status: 400 });
  }

  const start = new Date(startTime || new Date());
  const end = endTime ? new Date(endTime) : null;
  const duration = end ? Math.floor((end.getTime() - start.getTime()) / 1000) : null;

  const entry = await prisma.timeEntry.create({
    data: {
      description: description.trim(),
      projectId,
      startTime: start,
      endTime: end,
      duration,
    },
    include: { project: true },
  });

  await prisma.taskName.upsert({
    where: { name_projectId: { name: description.trim(), projectId } },
    update: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
    create: { name: description.trim(), projectId },
  });

  return NextResponse.json(entry, { status: 201 });
}
