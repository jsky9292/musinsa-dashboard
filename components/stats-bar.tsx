type Props = {
  category: string;
  productCount: number;
  totalReviews: number;
  productsWithReviews: number;
  avgPrice: number;
};

const Card = ({ label, value }: { label: string; value: string }) => (
  <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl px-5 py-4">
    <div className="text-xs text-[var(--muted)] uppercase tracking-wider">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);

export default function StatsBar(p: Props) {
  return (
    <div className="flex gap-4 mb-6">
      <Card label="카테고리" value={p.category} />
      <Card label="상품 수" value={p.productCount.toLocaleString()} />
      <Card label="리뷰 수" value={p.totalReviews.toLocaleString()} />
      <Card label="리뷰 보유" value={`${p.productsWithReviews}/${p.productCount}`} />
      <Card label="평균가" value={`${p.avgPrice.toLocaleString()}원`} />
    </div>
  );
}
