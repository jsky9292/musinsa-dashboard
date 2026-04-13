import Sidebar from "@/components/sidebar";
import StatsBar from "@/components/stats-bar";
import InsightRunner from "@/components/insight-runner";
import { getAnalysis, getBranding, getStats, listRunIds } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function InsightPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const params = await searchParams;
  const runIds = await listRunIds();
  const runId = params.run || runIds[0];
  if (!runId) return <div className="p-8">데이터 없음</div>;

  const branding = await getBranding(runId);
  const analysis = await getAnalysis(runId);
  const stats = await getStats(runId);

  return (
    <div className="flex min-h-screen items-start">
      <Sidebar runIds={runIds} />
      <main className="flex-1 min-w-0 p-6 lg:p-8 max-w-6xl">
        <StatsBar {...stats} />
        <InsightRunner runId={runId} hasBranding={!!branding} />

        {!branding && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center text-[var(--muted)]">
            아직 분석 결과가 없습니다. 위 버튼으로 Gemini 분석을 실행하세요.
          </div>
        )}

        {branding && (
          <>
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-l-4 border-[var(--accent)] rounded-xl p-6 mb-6">
              <div className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider mb-2">
                포지셔닝
              </div>
              <div className="text-lg font-semibold">{branding.positioning_statement || "-"}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card title="🕳️ 시장 틈새" items={branding.market_gap} />
              <Card title="⚠️ 타겟 페인포인트" items={branding.target_pain_points} />
              <Card title="✍️ 카피 방향" items={branding.copy_directions} />
              <Card title="🚫 피해야 할 요소" items={branding.avoid_pitfalls} />
              <Card title="✅ 필수 스펙" items={branding.must_have_features} />
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                  💰 가격 전략
                </h3>
                <p className="text-sm">{branding.pricing_insight || "-"}</p>
              </div>
            </div>

            {branding.differentiator_keywords && branding.differentiator_keywords.length > 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6">
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                  🔑 차별화 키워드
                </h3>
                <div className="flex flex-wrap gap-2">
                  {branding.differentiator_keywords.map((k, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full text-xs font-mono"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">📊 상품별 리뷰 분석</h2>
                <div className="space-y-3">
                  {analysis.map((item) => (
                    <details
                      key={item.product_id}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-xl"
                    >
                      <summary className="px-5 py-3 cursor-pointer text-sm font-medium">
                        #{item.rank} [{item.brand}] {item.name?.slice(0, 60)} · ⭐
                        {(item.review_analysis?.avg_rating || 0).toFixed(1)} · 리뷰{" "}
                        {item.review_analysis?.review_count || 0}
                      </summary>
                      <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="font-semibold text-green-500 mb-1">👍 긍정</div>
                          <div className="text-[var(--muted)]">
                            {item.review_analysis?.positive_keywords?.join(", ") || "-"}
                          </div>
                          <div className="font-semibold mt-3 mb-1">핏</div>
                          <div className="text-[var(--muted)]">
                            {item.review_analysis?.fit_feedback || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-red-500 mb-1">👎 부정</div>
                          <div className="text-[var(--muted)]">
                            {item.review_analysis?.negative_keywords?.join(", ") || "-"}
                          </div>
                          <div className="font-semibold mt-3 mb-1">소재</div>
                          <div className="text-[var(--muted)]">
                            {item.review_analysis?.material_feedback || "-"}
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Card({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
        {title}
      </h3>
      <ul className="space-y-1.5 text-sm">
        {(items && items.length > 0 ? items : ["-"]).map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--accent)]">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
