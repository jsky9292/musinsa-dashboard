import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { getRanking, getReviews, getCategoryFromRunId } from "@/lib/data";
import { getSupabaseAdmin, hasSupabase } from "@/lib/supabase";

const OUTPUT_DIR = path.join(process.cwd(), "..", "output");

async function persist(runId: string, branding: any, analysis: any[]) {
  if (hasSupabase()) {
    const sb = getSupabaseAdmin();
    if (sb) {
      await sb.from("branding").upsert({ run_id: runId, ...branding });
      await sb.from("analyses").delete().eq("run_id", runId);
      const rows = analysis.map((a) => ({
        run_id: runId,
        product_id: String(a.product_id),
        rank: a.rank,
        review_analysis: a.review_analysis || {},
      }));
      if (rows.length > 0) await sb.from("analyses").insert(rows);
      return;
    }
  }
  // 로컬 fs fallback
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${runId}_analysis.json`),
      JSON.stringify(analysis, null, 2),
      "utf-8"
    );
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${runId}_branding.json`),
      JSON.stringify(branding, null, 2),
      "utf-8"
    );
  }
}

function extractJson(text: string): any {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.split("```")[1];
    if (t.startsWith("json")) t = t.slice(4);
  }
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

export async function POST(req: NextRequest) {
  const { runId, apiKey } = await req.json();
  if (!runId || !apiKey) {
    return NextResponse.json({ error: "runId, apiKey 필수" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // 리뷰 분석: 빠른 Flash, 브랜딩 인사이트: 고품질 Pro
  const flashModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const proModel = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

  const ranking = await getRanking(runId);
  const reviews = await getReviews(runId);
  const category = getCategoryFromRunId(runId);

  const top = ranking.slice(0, 10);
  const competitorAnalyses: any[] = [];

  for (const product of top) {
    const productReviews = reviews[product.product_id] || [];
    if (productReviews.length === 0) {
      competitorAnalyses.push({
        product_id: product.product_id,
        rank: product.rank,
        brand: product.brand,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
        review_analysis: { review_count: 0 },
      });
      continue;
    }

    const reviewLines = productReviews
      .slice(0, 30)
      .map((r) => `[${r.rating}점] ${(r.text || "").replace(/\n/g, " ").slice(0, 250)}`)
      .filter((l) => l.length > 10)
      .join("\n");

    const prompt = `다음은 무신사 상품의 실제 고객 리뷰입니다.

상품: ${product.name}

[리뷰]
${reviewLines}

다음 JSON으로 분석. JSON만 출력:
{
  "positive_keywords": ["긍정 키워드 최대 8개"],
  "negative_keywords": ["부정 키워드 최대 8개"],
  "fit_feedback": "핏/사이즈 핵심 1-2문장",
  "material_feedback": "소재/품질 핵심 1-2문장",
  "price_value": "가격 만족도 1문장",
  "improvement_needs": ["개선 필요 최대 5개"],
  "sentiment_score": 0.0
}`;

    try {
      const resp = await flashModel.generateContent(prompt);
      const result = extractJson(resp.response.text());
      result.review_count = productReviews.length;
      const ratings = productReviews
        .map((r) => parseInt(String(r.rating || 0), 10))
        .filter((n) => !isNaN(n));
      result.avg_rating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      competitorAnalyses.push({
        product_id: product.product_id,
        rank: product.rank,
        brand: product.brand,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
        review_analysis: result,
      });
    } catch (e: any) {
      competitorAnalyses.push({
        product_id: product.product_id,
        rank: product.rank,
        brand: product.brand,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
        review_analysis: { error: String(e?.message || e), review_count: productReviews.length },
      });
    }
  }

  // 브랜딩 인사이트
  const summary = JSON.stringify(competitorAnalyses, null, 2).slice(0, 12000);
  const brandPrompt = `다음은 무신사 [${category}] 카테고리 상위 경쟁 상품 리뷰 분석입니다.

${summary}

신규 브랜드 포지셔닝 전략을 JSON으로 출력:
{
  "market_gap": ["경쟁사 공통 약점"],
  "differentiator_keywords": ["차별화 키워드"],
  "positioning_statement": "한 문장 포지셔닝",
  "copy_directions": ["카피 방향 3가지"],
  "target_pain_points": ["고객 불만 포인트"],
  "pricing_insight": "가격 분석 + 권장 가격대",
  "must_have_features": ["반드시 넣을 스펙"],
  "avoid_pitfalls": ["피해야 할 요소"]
}

JSON만 출력.`;

  let branding: any = {};
  try {
    const resp = await proModel.generateContent(brandPrompt);
    branding = extractJson(resp.response.text());
  } catch (e: any) {
    branding = { error: String(e?.message || e) };
  }

  // 저장 (Supabase 우선, fs fallback)
  await persist(runId, branding, competitorAnalyses);

  return NextResponse.json({ ok: true, branding, analysis: competitorAnalyses });
}
