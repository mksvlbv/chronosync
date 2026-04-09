import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entry = await prisma.timeEntry.findFirst({
    where: { endTime: null },
    include: { project: true },
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json(entry);
}
