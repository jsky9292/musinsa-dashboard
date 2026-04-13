"use client";
import { useEffect, useState } from "react";
import { Sparkles, Save, Trash2, Loader2 } from "lucide-react";

const KEY_STORAGE = "gemini_api_key";

export default function InsightRunner({ runId, hasBranding }: { runId: string; hasBranding: boolean }) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const k = localStorage.getItem(KEY_STORAGE) || "";
    setApiKey(k);
    setSaved(!!k);
  }, []);

  const save = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem(KEY_STORAGE, apiKey.trim());
    setSaved(true);
  };

  const remove = () => {
    localStorage.removeItem(KEY_STORAGE);
    setApiKey("");
    setSaved(false);
  };

  const run = async () => {
    if (!apiKey.trim()) {
      setError("API 키를 입력하세요");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");
      window.location.reload();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-[var(--accent)]" />
        <h3 className="font-semibold">Gemini API</h3>
        {saved && <span className="text-[10px] text-green-500">✓ 저장됨</span>}
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="GEMINI_API_KEY (aistudio.google.com/app/apikey)"
          className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={save}
          className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--card-hover)] flex items-center gap-1"
        >
          <Save size={14} /> 저장
        </button>
        <button
          onClick={remove}
          className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--card-hover)] flex items-center gap-1"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <button
        onClick={run}
        disabled={loading || !apiKey.trim()}
        className="mt-3 w-full bg-[var(--accent)] hover:bg-[#5d9ce8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Gemini 분석 중...
          </>
        ) : (
          <>
            <Sparkles size={16} /> {hasBranding ? "다시 분석" : "분석 실행"}
          </>
        )}
      </button>
      {error && <div className="mt-2 text-xs text-[var(--danger)]">{error}</div>}
    </div>
  );
}
