"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, BarChart3, MessageSquare, Sparkles } from "lucide-react";
import CrawlForm from "./crawl-form";

const NAV = [
  { href: "/", label: "상품", icon: LayoutGrid },
  { href: "/charts", label: "차트", icon: BarChart3 },
  { href: "/reviews", label: "리뷰", icon: MessageSquare },
  { href: "/insight", label: "AI 인사이트", icon: Sparkles },
];

export default function Sidebar({ runIds }: { runIds: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const runId = params.get("run") || runIds[0] || "";

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("run", e.target.value);
    router.push(`${pathname}?${sp.toString()}`);
  };

  const buildHref = (href: string) => {
    const sp = new URLSearchParams();
    if (runId) sp.set("run", runId);
    return `${href}?${sp.toString()}`;
  };

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--card)] p-5 flex flex-col gap-6 sticky top-0 h-screen overflow-y-auto">
      <div>
        <h1 className="text-lg font-bold tracking-tight">🎯 무신사 분석</h1>
        <p className="text-xs text-[var(--muted)] mt-1">경쟁분석 + AI 인사이트</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
          분석 Run
        </label>
        <select
          className="mt-2 w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          value={runId}
          onChange={onChange}
        >
          {runIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={buildHref(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] pt-4">
        <CrawlForm />
      </div>
    </aside>
  );
}
