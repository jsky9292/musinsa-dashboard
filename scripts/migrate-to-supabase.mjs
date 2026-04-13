// 로컬 output/*.json 파일을 Supabase로 마이그레이션
// 실행: node scripts/migrate-to-supabase.mjs
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "..", "output");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("환경변수 필요: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

function listRuns() {
  if (!fs.existsSync(OUTPUT_DIR)) return [];
  const ids = new Set();
  for (const f of fs.readdirSync(OUTPUT_DIR)) {
    if (f.endsWith("_ranking.json")) ids.add(f.replace("_ranking.json", ""));
  }
  return [...ids];
}

function readJson(runId, suffix) {
  const p = path.join(OUTPUT_DIR, `${runId}_${suffix}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function categoryFromRunId(runId) {
  const parts = runId.split("_");
  return parts.length >= 3 ? parts.slice(0, -2).join("_") : runId;
}

async function migrateRun(runId) {
  console.log(`\n→ ${runId}`);
  const ranking = readJson(runId, "ranking") || [];
  const reviewsMap = readJson(runId, "reviews") || {};
  const branding = readJson(runId, "branding");
  const analysis = readJson(runId, "analysis") || [];

  if (ranking.length === 0) {
    console.log("  랭킹 없음, 스킵");
    return;
  }

  const totalReviews = Object.values(reviewsMap).reduce((s, a) => s + (a?.length || 0), 0);

  // runs upsert
  await sb.from("runs").upsert({
    id: runId,
    category: categoryFromRunId(runId),
    total_products: ranking.length,
    total_reviews: totalReviews,
  });

  // products upsert
  const products = ranking.map((p) => ({
    run_id: runId,
    product_id: String(p.product_id),
    rank: p.rank,
    brand: p.brand,
    brand_slug: p.brand_slug,
    name: p.name,
    price: p.price || 0,
    original_price: p.original_price || 0,
    discount_rate: p.discount_rate,
    review_count: p.review_count || 0,
    review_score: p.review_score || 0,
    like_count: p.like_count || 0,
    gender: p.gender,
    thumbnail: p.thumbnail,
    url: p.url,
    tags: p.tags || [],
    page_view: p.page_view || 0,
    purchase_count: p.purchase_count || 0,
  }));
  const { error: pErr } = await sb.from("products").upsert(products);
  if (pErr) console.error("  products error:", pErr.message);
  else console.log(`  products: ${products.length}`);

  // reviews insert (delete old first)
  await sb.from("reviews").delete().eq("run_id", runId);
  const reviewRows = [];
  for (const [pid, revs] of Object.entries(reviewsMap)) {
    for (const r of revs || []) {
      reviewRows.push({
        run_id: runId,
        product_id: String(pid),
        rating: parseInt(r.rating || 0, 10) || 0,
        text: r.text || "",
        option: r.option || null,
        helpful: r.helpful || 0,
        date: r.date || null,
        height: r.height || null,
        weight: r.weight || null,
      });
    }
  }
  if (reviewRows.length > 0) {
    // batch insert (chunks of 500)
    for (let i = 0; i < reviewRows.length; i += 500) {
      const chunk = reviewRows.slice(i, i + 500);
      const { error } = await sb.from("reviews").insert(chunk);
      if (error) console.error(`  reviews chunk ${i}: ${error.message}`);
    }
    console.log(`  reviews: ${reviewRows.length}`);
  }

  // branding
  if (branding && !branding.error) {
    await sb.from("branding").upsert({
      run_id: runId,
      positioning_statement: branding.positioning_statement,
      market_gap: branding.market_gap || [],
      differentiator_keywords: branding.differentiator_keywords || [],
      copy_directions: branding.copy_directions || [],
      target_pain_points: branding.target_pain_points || [],
      pricing_insight: branding.pricing_insight,
      must_have_features: branding.must_have_features || [],
      avoid_pitfalls: branding.avoid_pitfalls || [],
    });
    console.log("  branding: ✓");
  }

  // analyses
  if (analysis.length > 0) {
    await sb.from("analyses").delete().eq("run_id", runId);
    const arows = analysis.map((a) => ({
      run_id: runId,
      product_id: String(a.product_id),
      rank: a.rank,
      review_analysis: a.review_analysis || {},
    }));
    const { error } = await sb.from("analyses").insert(arows);
    if (error) console.error("  analyses error:", error.message);
    else console.log(`  analyses: ${arows.length}`);
  }
}

const runs = listRuns();
console.log(`총 ${runs.length}개 run 발견`);
for (const r of runs) {
  try {
    await migrateRun(r);
  } catch (e) {
    console.error(`  실패: ${e.message}`);
  }
}
console.log("\n✓ 마이그레이션 완료");
