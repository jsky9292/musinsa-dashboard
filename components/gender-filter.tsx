"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "all", label: "전체" },
  { value: "남성", label: "남성" },
  { value: "여성", label: "여성" },
  { value: "남녀공용", label: "공용" },
];

export default function GenderFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("gender") || "all";

  const setGender = (g: string) => {
    const sp = new URLSearchParams(params.toString());
    if (g === "all") sp.delete("gender");
    else sp.set("gender", g);
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="inline-flex bg-[var(--card)] border border-[var(--border)] rounded-lg p-1 gap-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setGender(o.value)}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            current === o.value
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
