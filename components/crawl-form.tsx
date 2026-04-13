"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

const PRESETS = ["반팔티셔츠", "맨투맨", "후드티", "긴팔티셔츠", "셔츠", "니트", "반바지", "청바지"];

export default function CrawlForm() {
  const [category, setCategory] = useState("반팔티셔츠");
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const run = async () => {
    if (!category.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category.trim(), limit }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ type: "ok", text: "수집 완료! 페이지 새로고침" });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMsg({ type: "err", text: (data.error || "실패").slice(0, 200) });
      }
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
        새 데이터 수집
      </label>
      <div className="mt-2 space-y-2">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="cat-presets"
          placeholder="카테고리"
          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <datalist id="cat-presets">
          {PRESETS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <div className="flex gap-2">
          <input
            type="number"
            value={limit}
            min={10}
            max={200}
            step={10}
            onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
            className="w-20 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={run}
            disabled={loading}
            className="flex-1 bg-[var(--accent)] hover:bg-[#5d9ce8] disabled:opacity-50 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {loading ? "수집 중..." : "수집"}
          </button>
        </div>
        {msg && (
          <div
            className={`text-[11px] px-2 py-1.5 rounded ${
              msg.type === "ok"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
