import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
  }

  const existing = await prisma.timeEntry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - existing.startTime.getTime()) / 1000);

  const entry = await prisma.timeEntry.update({
    where: { id },
    data: { endTime, duration },
    include: { project: true },
  });

  return NextResponse.json(entry);
}
