import Image from "next/image";
import { Star } from "lucide-react";
import Sidebar from "@/components/sidebar";
import StatsBar from "@/components/stats-bar";
import { getRanking, getReviews, getStats, listRunIds } from "@/lib/data";

function safeInt(v: unknown): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return isNaN(n) ? 0 : n;
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string; pid?: string }>;
}) {
  const params = await searchParams;
  const runIds = await listRunIds();
  const runId = params.run || runIds[0];
  if (!runId) return <div className="p-8">데이터 없음</div>;

  const ranking = await getRanking(runId);
  const reviews = await getReviews(runId);
  const stats = await getStats(runId);

  const productsWithReviews = ranking.filter((p) => (reviews[p.product_id] || []).length > 0);
  const selectedPid = params.pid || productsWithReviews[0]?.product_id;
  const selected = ranking.find((p) => p.product_id === selectedPid);
  const productReviews = selectedPid ? reviews[selectedPid] || [] : [];

  const ratings = productReviews.map((r) => safeInt(r.rating));
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return (
    <div className="flex min-h-screen items-start">
      <Sidebar runIds={runIds} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        <StatsBar {...stats} />
        <div className="grid grid-cols-12 gap-6">
          {/* 좌: 상품 리스트 */}
          <div className="col-span-12 lg:col-span-3 bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase px-2 py-2">
              상품 ({productsWithReviews.length})
            </h3>
            {productsWithReviews.map((p) => {
              const isActive = p.product_id === selectedPid;
              const sp = new URLSearchParams();
              sp.set("run", runId);
              sp.set("pid", p.product_id);
              return (
                <a
                  key={p.product_id}
                  href={`/reviews?${sp.toString()}`}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg text-xs ${
                    isActive ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--card-hover)]"
                  }`}
                >
                  <div className="w-10 h-10 relative shrink-0 rounded overflow-hidden bg-[#1a1d24]">
                    {p.thumbnail && (
                      <Image src={p.thumbnail} alt="" fill sizes="40px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold ${isActive ? "text-white" : ""}`}>#{p.rank}</div>
                    <div className="truncate">{p.brand}</div>
                    <div className={`truncate text-[10px] ${isActive ? "text-white/70" : "text-[var(--muted)]"}`}>
                      리뷰 {(reviews[p.product_id] || []).length}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* 우: 선택 상품 + 리뷰 */}
          <div className="col-span-12 lg:col-span-9 space-y-4">
            {selected && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex gap-5">
                <div className="w-32 h-32 relative shrink-0 rounded-lg overflow-hidden bg-[#1a1d24]">
                  {selected.thumbnail && (
                    <Image
                      src={selected.thumbnail}
                      alt={selected.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase text-[var(--muted)]">{selected.brand}</div>
                  <div className="font-semibold mt-1">{selected.name}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-bold">{selected.price.toLocaleString()}원</span>
                    {selected.discount_rate && selected.discount_rate !== "0%" && (
                      <span className="text-[var(--danger)] text-sm font-bold">{selected.discount_rate}</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <div className="bg-[var(--background)] px-3 py-1.5 rounded-lg">
                      평균 별점 <span className="font-bold text-yellow-500">{avg.toFixed(2)}</span> / 5
                    </div>
                    <div className="bg-[var(--background)] px-3 py-1.5 rounded-lg">
                      수집 리뷰 <span className="font-bold">{productReviews.length}</span>개
                    </div>
                    <a
                      href={selected.url}
                      target="_blank"
                      className="text-[var(--accent)] hover:underline"
                    >
                      무신사에서 보기 →
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-2">
              {productReviews.length === 0 && (
                <div className="text-center text-[var(--muted)] py-12">리뷰가 없습니다.</div>
              )}
              {productReviews.map((r, idx) => {
                const rating = safeInt(r.rating);
                return (
                  <div key={idx} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-1 shrink-0">
                        <Star size={14} className="fill-yellow-500 text-yellow-500" />
                        <span className="font-bold text-sm">{rating}</span>
                      </div>
                      <div className="flex-1 text-sm whitespace-pre-wrap">{r.text || <em className="text-[var(--muted)]">텍스트 없음</em>}</div>
                    </div>
                    <div className="mt-2 ml-9 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
                      {r.option && <span>옵션: {r.option}</span>}
                      {r.height && <span>키 {r.height}cm</span>}
                      {r.weight && <span>몸무게 {r.weight}kg</span>}
                      {r.helpful !== undefined && r.helpful > 0 && <span>👍 {r.helpful}</span>}
                      {r.date && <span>{r.date}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
