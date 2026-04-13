"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Cell,
} from "recharts";
import type { Product } from "@/lib/data";

const COLOR = "#4a90e2";
const DANGER = "#ff5252";
const GRID = "#252832";

const tooltipStyle = {
  background: "#14161c",
  border: "1px solid #252832",
  borderRadius: "8px",
  fontSize: "12px",
};

function bin(values: number[], bins = 15) {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / bins || 1;
  const out: { range: string; count: number }[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = min + i * step;
    const hi = lo + step;
    const count = values.filter((v) => v >= lo && (i === bins - 1 ? v <= hi : v < hi)).length;
    out.push({ range: `${Math.round(lo / 1000)}k`, count });
  }
  return out;
}

export function PriceHistogram({ products }: { products: Product[] }) {
  const data = bin(products.map((p) => p.price || 0));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="range" stroke="#8b9bb4" fontSize={11} />
        <YAxis stroke="#8b9bb4" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1a1d24" }} />
        <Bar dataKey="count" fill={COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopBrands({ products }: { products: Product[] }) {
  const counts: Record<string, number> = {};
  for (const p of products) {
    counts[p.brand] = (counts[p.brand] || 0) + 1;
  }
  const data = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([brand, count]) => ({ brand, count }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis type="number" stroke="#8b9bb4" fontSize={11} />
        <YAxis dataKey="brand" type="category" stroke="#8b9bb4" fontSize={11} width={80} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1a1d24" }} />
        <Bar dataKey="count" fill={COLOR} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PriceVsRating({ products }: { products: Product[] }) {
  const data = products
    .filter((p) => (p.review_count || 0) > 0)
    .map((p) => ({
      price: p.price || 0,
      star: (p.review_score || 0) / 20,
      reviews: p.review_count,
      brand: p.brand,
      name: p.name,
    }));

  if (data.length === 0) return <div className="text-[var(--muted)] text-sm">리뷰가 있는 상품이 없습니다.</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis type="number" dataKey="price" name="가격" stroke="#8b9bb4" fontSize={11} />
        <YAxis type="number" dataKey="star" name="별점" stroke="#8b9bb4" fontSize={11} domain={[0, 5]} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value, name) => {
            if (name === "가격") return Number(value).toLocaleString() + "원";
            return String(value);
          }}
        />
        <Scatter data={data} fill={COLOR}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLOR} fillOpacity={0.7} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function DiscountHistogram({ products }: { products: Product[] }) {
  const values = products
    .map((p) => parseInt(String(p.discount_rate || "0").replace("%", ""), 10))
    .filter((v) => !isNaN(v));
  const buckets: Record<string, number> = {
    "0%": 0, "1-10%": 0, "11-20%": 0, "21-30%": 0,
    "31-40%": 0, "41-50%": 0, "51-70%": 0, "71%+": 0,
  };
  for (const v of values) {
    if (v === 0) buckets["0%"]++;
    else if (v <= 10) buckets["1-10%"]++;
    else if (v <= 20) buckets["11-20%"]++;
    else if (v <= 30) buckets["21-30%"]++;
    else if (v <= 40) buckets["31-40%"]++;
    else if (v <= 50) buckets["41-50%"]++;
    else if (v <= 70) buckets["51-70%"]++;
    else buckets["71%+"]++;
  }
  const data = Object.entries(buckets).map(([range, count]) => ({ range, count }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="range" stroke="#8b9bb4" fontSize={11} />
        <YAxis stroke="#8b9bb4" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1a1d24" }} />
        <Bar dataKey="count" fill={DANGER} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
