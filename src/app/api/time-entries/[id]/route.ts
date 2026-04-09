import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { description, projectId, startTime, endTime } = body;

  const existing = await prisma.timeEntry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const start = startTime ? new Date(startTime) : existing.startTime;
  const end = endTime ? new Date(endTime) : existing.endTime;
  const duration = end ? Math.floor((end.getTime() - start.getTime()) / 1000) : null;

  const entry = await prisma.timeEntry.update({
    where: { id },
    data: {
      ...(description !== undefined && { description: description.trim() }),
      ...(projectId !== undefined && { projectId }),
      startTime: start,
      endTime: end,
      duration,
    },
    include: { project: true },
  });

  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.timeEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
