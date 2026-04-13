import Sidebar from "@/components/sidebar";
import StatsBar from "@/components/stats-bar";
import { getRanking, getStats, listRunIds } from "@/lib/data";
import {
  PriceHistogram,
  TopBrands,
  PriceVsRating,
  DiscountHistogram,
} from "@/components/charts";

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const params = await searchParams;
  const runIds = await listRunIds();
  const runId = params.run || runIds[0];
  if (!runId) return <div className="p-8">데이터 없음</div>;

  const ranking = await getRanking(runId);
  const stats = await getStats(runId);

  return (
    <div className="flex min-h-screen items-start">
      <Sidebar runIds={runIds} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        <StatsBar {...stats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="가격 분포">
            <PriceHistogram products={ranking} />
          </ChartCard>
          <ChartCard title="TOP 10 브랜드 (랭크인 횟수)">
            <TopBrands products={ranking} />
          </ChartCard>
          <ChartCard title="가격 vs 별점 (버블=리뷰수)">
            <PriceVsRating products={ranking} />
          </ChartCard>
          <ChartCard title="할인율 분포">
            <DiscountHistogram products={ranking} />
          </ChartCard>
        </div>
      </main>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}
