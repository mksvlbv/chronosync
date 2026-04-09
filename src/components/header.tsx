"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTimerStore } from "@/store/timer-store";
import { formatDuration } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Timer" },
  { href: "/projects", label: "Projects" },
  { href: "/reports", label: "Reports" },
];

export function Header() {
  const pathname = usePathname();
  const { isRunning, seconds } = useTimerStore();

  return (
    <>
    <header className="h-16 border-b border-base-800/50 flex items-center justify-between px-6 lg:px-12 relative z-10 bg-base-950/50 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-base-700 to-base-900 border border-base-700 flex items-center justify-center shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-brand-400">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-lg">
            Chrono<span className="text-brand-400">Sync</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-base-900/50 p-1 rounded-full border border-base-800">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                  isActive
                    ? "bg-base-800 text-white shadow-sm"
                    : "text-base-400 hover:text-white hover:bg-base-800/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {isRunning && (
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm font-mono font-medium animate-timer-pulse"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            {formatDuration(seconds)}
          </Link>
        )}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 border-base-800 flex items-center justify-center text-sm font-bold text-white shadow-md">
          CS
        </div>
      </div>
    </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-950/90 backdrop-blur-md border-t border-base-800 flex items-center justify-around py-2 px-4 safe-area-inset-bottom">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-all",
                isActive ? "text-brand-400" : "text-base-500 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
