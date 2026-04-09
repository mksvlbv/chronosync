"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchReport, type ReportData } from "@/lib/api/reports";
import { formatDuration, formatDurationShort, formatDateShort } from "@/lib/utils";
import { addWeeks, subWeeks, addMonths, subMonths, addDays, subDays, format } from "date-fns";
import { DownloadSimple, CaretLeft, CaretRight, ClockCountdown } from "@phosphor-icons/react";

const PERIODS = ["Day", "Week", "Month"] as const;

function BarChart({ data, projects }: { data: ReportData["chartData"]; projects: ReportData["byProject"] }) {
  const maxTotal = Math.max(...data.map((d) => (d as Record<string, unknown>).total as number || 0), 1);

  return (
    <div className="relative h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-base-800/50 w-full h-0" />
        ))}
      </div>

      {data.map((day, i) => {
        const dayData = day as Record<string, unknown>;
        const total = (dayData.total as number) || 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full max-w-[40px] flex flex-col-reverse rounded-t-lg overflow-hidden">
              {projects.map((project) => {
                const val = (dayData[project.name] as number) || 0;
                if (val === 0) return null;
                const height = (val / maxTotal) * 240;
                return (
                  <div
                    key={project.projectId}
                    className="transition-all hover:brightness-110"
                    style={{
                      height: `${Math.max(height, 4)}px`,
                      background: `linear-gradient(to top, ${project.color}cc, ${project.color})`,
                    }}
                    title={`${project.name}: ${formatDurationShort(val)}`}
                  />
                );
              })}
              {total === 0 && <div className="h-1 bg-base-800 rounded" />}
            </div>
            <span className="text-xs text-base-500">{dayData.date as string}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<string>("Week");
  const [date, setDate] = useState(new Date());
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    const data = await fetchReport({ period: period.toLowerCase(), date: date.toISOString() });
    setReport(data);
    setLoading(false);
  }, [period, date]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const navigate = (direction: "prev" | "next") => {
    const fn = direction === "prev"
      ? period === "Day" ? subDays : period === "Week" ? subWeeks : subMonths
      : period === "Day" ? addDays : period === "Week" ? addWeeks : addMonths;
    setDate(fn(date, 1));
  };

  const exportCSV = () => {
    if (!report) return;
    const headers = ["Date", "Project", "Task Name", "Duration (seconds)", "Duration"];
    const rows = report.entries.map((e) => [
      formatDateShort(new Date(e.startTime)),
      e.project.name,
      e.description,
      String(e.duration || 0),
      formatDuration(e.duration || 0),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chronosync-report-${period.toLowerCase()}-${format(date, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dateLabel = report
    ? `${formatDateShort(new Date(report.start))} — ${formatDateShort(new Date(report.end))}`
    : "...";

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 pb-24 md:pb-10 flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reports</h1>
          <p className="text-base-400 mt-1">Analyze your productivity trends and project distributions.</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!report || report.entries.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-base-900 border border-base-800 rounded-lg text-sm font-medium text-white hover:bg-base-800 transition-all hover:border-base-700 disabled:opacity-50"
        >
          <DownloadSimple size={18} />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-1.5 bg-base-900/50 border border-base-800 rounded-2xl">
        <div className="flex items-center gap-1 p-1 bg-base-950/50 rounded-xl border border-base-800/50">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-1.5 text-sm font-medium rounded-lg transition-all ${
                period === p ? "bg-base-700 text-white shadow-sm" : "text-base-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-1.5 text-sm font-medium text-base-400 bg-base-900 rounded-xl border border-base-800">
          <button onClick={() => navigate("prev")} className="hover:text-white transition-colors">
            <CaretLeft size={16} />
          </button>
          <span className="text-white">{dateLabel}</span>
          <button onClick={() => navigate("next")} className="hover:text-white transition-colors">
            <CaretRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-2 border-base-700 border-t-brand-500 rounded-full" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-base-900/40 border border-base-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-semibold text-white">Time Distribution</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  {report.byProject.map((p) => (
                    <div key={p.projectId} className="flex items-center gap-2 text-xs text-base-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
              <BarChart data={report.chartData} projects={report.byProject} />
            </div>

            <div className="bg-gradient-to-br from-base-900/80 to-base-950 border border-base-800 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                  <ClockCountdown size={24} className="text-brand-400" />
                </div>
                <h3 className="text-base-400 text-sm font-medium">Total Tracked</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-mono font-bold text-white tracking-tighter">
                    {formatDurationShort(report.totalSeconds)}
                  </span>
                </div>
              </div>
              <div className="pt-6 border-t border-base-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-400">Daily Average</span>
                  <span className="text-white font-mono">{formatDurationShort(report.dailyAverage)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-base-900/20 border border-base-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-base-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">Detailed Activities</h3>
              <span className="text-sm text-base-400">{report.entries.length} entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-base-900/40 border-b border-base-800">
                    <th className="px-6 py-3 text-xs font-semibold text-base-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-base-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-xs font-semibold text-base-500 uppercase tracking-wider">Task Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-base-500 uppercase tracking-wider text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-800/50">
                  {report.entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-base-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-base-400 font-medium">
                        {formatDateShort(new Date(entry.startTime))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.project.color }} />
                          <span className="text-sm text-base-200">{entry.project.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-base-200">{entry.description}</td>
                      <td className="px-6 py-4 text-right font-mono text-white text-sm">
                        {formatDuration(entry.duration || 0)}
                      </td>
                    </tr>
                  ))}
                  {report.entries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-base-500">
                        No entries for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
