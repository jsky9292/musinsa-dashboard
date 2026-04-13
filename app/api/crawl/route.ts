import { NextRequest, NextResponse } from "next/server";
import { crawl } from "@/lib/crawler";
import { getSupabaseAdmin, hasSupabase } from "@/lib/supabase";

export const maxDuration = 120; // Vercel Pro: 최대 120초

export async function POST(req: NextRequest) {
  const { category, limit } = await req.json();
  if (!category) {
    return NextResponse.json({ error: "category 필수" }, { status: 400 });
  }

  const lim = Math.min(Math.max(parseInt(String(limit || 50), 10) || 50, 10), 100);

  try {
    const result = await crawl(category, lim);

    // Supabase 저장
    if (hasSupabase()) {
      const sb = getSupabaseAdmin();
      if (!sb) {
        return NextResponse.json({ error: "Supabase service key 미설정" }, { status: 500 });
      }

      // runs
      await sb.from("runs").upsert({
        id: result.runId,
        category: result.category,
        total_products: result.products.length,
        total_reviews: result.totalReviews,
      });

      // products
      const productRows = result.products.map((p) => ({
        run_id: result.runId,
        product_id: p.product_id,
        rank: p.rank,
        brand: p.brand,
        brand_slug: p.brand_slug,
        name: p.name,
        price: p.price,
        original_price: p.original_price,
        discount_rate: p.discount_rate,
        review_count: p.review_count,
        review_score: p.review_score,
        like_count: p.like_count,
        gender: p.gender,
        thumbnail: p.thumbnail,
        url: p.url,
        tags: p.tags,
        page_view: p.page_view,
        purchase_count: p.purchase_count,
      }));
      const { error: pErr } = await sb.from("products").upsert(productRows);
      if (pErr) console.error("products insert error:", pErr.message);

      // reviews
      await sb.from("reviews").delete().eq("run_id", result.runId);
      const reviewRows: any[] = [];
      for (const [pid, revs] of Object.entries(result.reviews)) {
        for (const r of revs) {
          reviewRows.push({
            run_id: result.runId,
            product_id: pid,
            rating: r.rating || 0,
            text: r.text || "",
            option: r.option || null,
            helpful: r.helpful || 0,
            date: r.date || null,
            height: r.height || null,
            weight: r.weight || null,
          });
        }
      }
      for (let i = 0; i < reviewRows.length; i += 500) {
        await sb.from("reviews").insert(reviewRows.slice(i, i + 500));
      }

      return NextResponse.json({
        ok: true,
        runId: result.runId,
        products: result.products.length,
        reviews: result.totalReviews,
      });
    }

    return NextResponse.json({ ok: true, runId: result.runId, products: result.products.length, reviews: result.totalReviews });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
