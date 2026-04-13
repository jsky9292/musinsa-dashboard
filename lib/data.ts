import fs from "fs";
import path from "path";
import { getSupabase, hasSupabase } from "./supabase";

const OUTPUT_DIR = path.join(process.cwd(), "..", "output");

export type Product = {
  rank: number;
  product_id: string;
  brand: string;
  brand_slug?: string;
  name: string;
  price: number;
  original_price: number;
  discount_rate: string;
  review_count: number;
  review_score: number;
  like_count?: number;
  gender?: string;
  is_sold_out?: boolean;
  thumbnail: string;
  url: string;
  tags?: string[];
  page_view?: number;
  purchase_count?: number;
};

export type Review = {
  product_id: string;
  review_id?: number;
  rating: number;
  text: string;
  option?: string;
  helpful?: number;
  date?: string;
  images?: string[];
  height?: number | null;
  weight?: number | null;
};

export type Branding = {
  positioning_statement?: string;
  market_gap?: string[];
  differentiator_keywords?: string[];
  copy_directions?: string[];
  target_pain_points?: string[];
  pricing_insight?: string;
  must_have_features?: string[];
  avoid_pitfalls?: string[];
};

export type Analysis = {
  product_id: string;
  rank: number;
  brand: string;
  name: string;
  price: number;
  thumbnail?: string;
  review_analysis: {
    positive_keywords?: string[];
    negative_keywords?: string[];
    fit_feedback?: string;
    material_feedback?: string;
    price_value?: string;
    improvement_needs?: string[];
    sentiment_score?: number;
    avg_rating?: number;
    review_count?: number;
  };
};

// ──────── Supabase 우선, fs fallback ────────

export async function listRunIds(): Promise<string[]> {
  if (hasSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from("runs").select("id").order("collected_at", { ascending: false });
    return (data ?? []).map((r) => r.id);
  }
  if (!fs.existsSync(OUTPUT_DIR)) return [];
  const files = fs.readdirSync(OUTPUT_DIR);
  const ids = new Set<string>();
  for (const f of files) {
    if (f.endsWith("_ranking.json")) ids.add(f.replace("_ranking.json", ""));
  }
  return [...ids].sort().reverse();
}

function readJson<T>(runId: string, suffix: string): T | null {
  const p = path.join(OUTPUT_DIR, `${runId}_${suffix}.json`);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return null;
  }
}

export async function getRanking(runId: string): Promise<Product[]> {
  if (hasSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb
      .from("products")
      .select("*")
      .eq("run_id", runId)
      .order("rank", { ascending: true });
    return (data ?? []) as Product[];
  }
  return readJson<Product[]>(runId, "ranking") ?? [];
}

export async function getReviews(runId: string): Promise<Record<string, Review[]>> {
  if (hasSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from("reviews").select("*").eq("run_id", runId);
    const map: Record<string, Review[]> = {};
    for (const r of data ?? []) {
      const pid = r.product_id;
      if (!map[pid]) map[pid] = [];
      map[pid].push(r as Review);
    }
    return map;
  }
  return readJson<Record<string, Review[]>>(runId, "reviews") ?? {};
}

export async function getBranding(runId: string): Promise<Branding | null> {
  if (hasSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from("branding").select("*").eq("run_id", runId).single();
    return (data as Branding) || null;
  }
  return readJson<Branding>(runId, "branding");
}

export async function getAnalysis(runId: string): Promise<Analysis[]> {
  if (hasSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb
      .from("analyses")
      .select("*")
      .eq("run_id", runId)
      .order("rank", { ascending: true });
    return (data ?? []) as unknown as Analysis[];
  }
  return readJson<Analysis[]>(runId, "analysis") ?? [];
}

export function getCategoryFromRunId(runId: string): string {
  const parts = runId.split("_");
  if (parts.length >= 3) return parts.slice(0, -2).join("_");
  return runId;
}

export async function getStats(runId: string) {
  const ranking = await getRanking(runId);
  const reviews = await getReviews(runId);
  const totalReviews = Object.values(reviews).reduce((s, a) => s + a.length, 0);
  const productsWithReviews = Object.values(reviews).filter((a) => a.length > 0).length;
  const avgPrice =
    ranking.length > 0
      ? Math.round(ranking.reduce((s, p) => s + (p.price || 0), 0) / ranking.length)
      : 0;
  return {
    category: getCategoryFromRunId(runId),
    productCount: ranking.length,
    totalReviews,
    productsWithReviews,
    avgPrice,
  };
}
