import Sidebar from "@/components/sidebar";
import StatsBar from "@/components/stats-bar";
import ProductCard from "@/components/product-card";
import GenderFilter from "@/components/gender-filter";
import { getRanking, getStats, listRunIds } from "@/lib/data";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ run?: string; gender?: string }>;
}) {
  const params = await searchParams;
  const runIds = await listRunIds();
  const runId = params.run || runIds[0];
  const genderFilter = params.gender;

  if (!runId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">데이터 없음</h1>
          <p className="text-[var(--muted)]">먼저 크롤러를 실행하세요:</p>
          <code className="block mt-3 px-4 py-2 bg-[var(--card)] rounded">
            python main.py --category 반팔티셔츠 --limit 50
          </code>
        </div>
      </div>
    );
  }

  const allRanking = await getRanking(runId);
  const stats = await getStats(runId);
  const ranking = genderFilter
    ? allRanking.filter((p) => p.gender === genderFilter)
    : allRanking;

  return (
    <div className="flex min-h-screen items-start">
      <Sidebar runIds={runIds} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        <StatsBar {...stats} />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            TOP {ranking.length} 상품 <span className="text-[var(--muted)] text-sm font-normal">(리뷰 × 별점 기반)</span>
          </h2>
          <GenderFilter />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {ranking.map((p) => (
            <ProductCard key={p.product_id} p={p} />
          ))}
        </div>
      </main>
    </div>
  );
}
