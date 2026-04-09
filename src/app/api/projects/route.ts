import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { timeEntries: true } },
    },
  });

  const projectsWithTotal = await Promise.all(
    projects.map(async (project) => {
      const result = await prisma.timeEntry.aggregate({
        where: { projectId: project.id, duration: { not: null } },
        _sum: { duration: true },
      });
      return {
        ...project,
        totalSeconds: result._sum.duration ?? 0,
        entryCount: project._count.timeEntries,
      };
    })
  );

  return NextResponse.json(projectsWithTotal);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, color, client } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: { name: name.trim(), color: color || "#10b981", client: client?.trim() || null },
  });

  return NextResponse.json(project, { status: 201 });
}
