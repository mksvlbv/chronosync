import type { TimeEntry } from "./time-entries";

export interface ReportData {
  entries: TimeEntry[];
  totalSeconds: number;
  dailyAverage: number;
  byProject: { projectId: string; name: string; color: string; totalSeconds: number }[];
  chartData: Record<string, unknown>[];
  period: string;
  start: string;
  end: string;
}

export async function fetchReport(params: { period: string; date: string }): Promise<ReportData> {
  const search = new URLSearchParams(params);
  const res = await fetch(`/api/reports?${search.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}
