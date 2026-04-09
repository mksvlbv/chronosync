import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "week";
  const dateStr = searchParams.get("date") || new Date().toISOString();
  const date = new Date(dateStr);

  let start: Date, end: Date;
  if (period === "day") {
    start = startOfDay(date);
    end = endOfDay(date);
  } else if (period === "month") {
    start = startOfMonth(date);
    end = endOfMonth(date);
  } else {
    start = startOfWeek(date, { weekStartsOn: 1 });
    end = endOfWeek(date, { weekStartsOn: 1 });
  }

  const entries = await prisma.timeEntry.findMany({
    where: {
      startTime: { gte: start, lte: end },
      duration: { not: null },
    },
    include: { project: true },
    orderBy: { startTime: "desc" },
  });

  const totalSeconds = entries.reduce((acc, e) => acc + (e.duration || 0), 0);

  const byProject: Record<string, { projectId: string; name: string; color: string; totalSeconds: number }> = {};
  entries.forEach((e) => {
    if (!byProject[e.projectId]) {
      byProject[e.projectId] = {
        projectId: e.projectId,
        name: e.project.name,
        color: e.project.color,
        totalSeconds: 0,
      };
    }
    byProject[e.projectId].totalSeconds += e.duration || 0;
  });

  let chartData;
  if (period === "day") {
    chartData = Array.from({ length: 24 }, (_, hour) => {
      const hourEntries = entries.filter((e) => new Date(e.startTime).getHours() === hour);
      const byProjectHour: Record<string, number> = {};
      hourEntries.forEach((e) => {
        byProjectHour[e.project.name] = (byProjectHour[e.project.name] || 0) + (e.duration || 0);
      });
      return {
        date: `${hour.toString().padStart(2, "0")}:00`,
        fullDate: format(start, "yyyy-MM-dd"),
        ...byProjectHour,
        total: hourEntries.reduce((acc, e) => acc + (e.duration || 0), 0),
      };
    });
  } else {
    const days = eachDayOfInterval({ start, end });
    chartData = days.map((day) => {
      const dayEntries = entries.filter(
        (e) => format(e.startTime, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      );
      const byProjectDay: Record<string, number> = {};
      dayEntries.forEach((e) => {
        byProjectDay[e.project.name] = (byProjectDay[e.project.name] || 0) + (e.duration || 0);
      });
      return {
        date: format(day, "EEE"),
        fullDate: format(day, "yyyy-MM-dd"),
        ...byProjectDay,
        total: dayEntries.reduce((acc, e) => acc + (e.duration || 0), 0),
      };
    });
  }

  const daysWithData = chartData.filter((d) => d.total > 0).length;

  return NextResponse.json({
    entries,
    totalSeconds,
    dailyAverage: daysWithData > 0 ? Math.round(totalSeconds / daysWithData) : 0,
    byProject: Object.values(byProject),
    chartData,
    period,
    start: start.toISOString(),
    end: end.toISOString(),
  });
}
