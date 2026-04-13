/**
 * 무신사 크롤러 (TypeScript - fetch 기반)
 * Python 없이 Vercel serverless에서 직접 실행
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const HEADERS = { "User-Agent": UA, Accept: "application/json", Referer: "https://www.musinsa.com/" };

const CATEGORY_MAP: Record<string, string> = {
  반팔티셔츠: "001001", 반팔티: "001001", 면티: "001001", 티셔츠: "001001",
  긴팔티셔츠: "001010", 셔츠: "001002", 맨투맨: "001005", 후드티: "001004",
  니트: "001006", 반바지: "003002", 청바지: "003004", 슬랙스: "003008",
  원피스: "100", 스니커즈: "005004", 백팩: "004005",
};

function resolveCategory(cat: string): string {
  return CATEGORY_MAP[cat] || (cat.match(/^\d+$/) ? cat : CATEGORY_MAP["티셔츠"]);
}

// ── 랭킹 (PLP API) ──

type RawProduct = {
  goodsNo: number;
  goodsName: string;
  goodsLinkUrl: string;
  thumbnail: string;
  displayGenderText: string;
  isSoldOut: boolean;
  normalPrice: number;
  price: number;
  saleRate: number;
  brand: string;
  brandName: string;
  reviewCount: number;
  reviewScore: number;
};

async function fetchPage(catCode: string, page: number, gender = "A"): Promise<RawProduct[]> {
  const params = new URLSearchParams({
    gf: gender,
    sortCode: "POPULAR",
    category: catCode,
    size: "60",
    caller: "CATEGORY",
    page: String(page),
  });
  const res = await fetch(`https://api.musinsa.com/api2/dp/v2/plp/goods?${params}`, { headers: HEADERS });
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.list ?? [];
}

async function fetchLikes(productIds: string[]): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};
  const res = await fetch("https://like.musinsa.com/like/api/v2/liketypes/goods/counts", {
    method: "POST",
    headers: { ...HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ relationIds: productIds.map((id) => parseInt(id, 10)) }),
  });
  if (!res.ok) return {};
  const json = await res.json();
  const items = json?.data?.contents?.items ?? [];
  const map: Record<string, number> = {};
  for (const it of items) map[String(it.relationId)] = it.count ?? 0;
  return map;
}

async function fetchTags(productId: string): Promise<string[]> {
  try {
    const res = await fetch(`https://goods-detail.musinsa.com/api2/goods/${productId}/tags`, { headers: HEADERS });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.tags ?? []).map((t: any) => (typeof t === "string" ? t : t?.name ?? ""));
  } catch {
    return [];
  }
}

async function fetchStat(productId: string): Promise<{ pageView: number; purchaseCount: number }> {
  try {
    const res = await fetch(`https://goods-detail.musinsa.com/api2/goods/${productId}/stat`, { headers: HEADERS });
    if (!res.ok) return { pageView: 0, purchaseCount: 0 };
    const json = await res.json();
    return {
      pageView: json?.data?.pageViewTotal ?? 0,
      purchaseCount: json?.data?.purchaseTotal ?? 0,
    };
  } catch {
    return { pageView: 0, purchaseCount: 0 };
  }
}

// ── 리뷰 API ──

async function fetchReviews(productId: string, maxReviews = 30): Promise<any[]> {
  const out: any[] = [];
  let page = 0;
  while (out.length < maxReviews) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "10",
      goodsNo: productId,
      sort: "up_cnt_desc",
      selectedSimilarNo: productId,
      myFilter: "false",
      hasPhoto: "false",
      isExperience: "false",
    });
    try {
      const res = await fetch(`https://goods.musinsa.com/api2/review/v1/view/list?${params}`, { headers: HEADERS });
      if (!res.ok) break;
      const json = await res.json();
      const list = json?.data?.list ?? [];
      if (list.length === 0) break;
      for (const r of list) {
        const profile = r.userProfileInfo ?? {};
        out.push({
          product_id: productId,
          rating: r.grade ?? 0,
          text: r.content ?? "",
          option: typeof r.goodsOption === "object" ? r.goodsOption?.optionName ?? "" : String(r.goodsOption ?? ""),
          helpful: r.likeCount ?? 0,
          date: r.createDate ?? "",
          height: profile.height ?? null,
          weight: profile.weight ?? null,
        });
        if (out.length >= maxReviews) break;
      }
      if (list.length < 10) break;
      page++;
    } catch {
      break;
    }
  }
  return out;
}

// ── 메인 크롤 함수 ──

export type CrawlResult = {
  runId: string;
  category: string;
  products: any[];
  reviews: Record<string, any[]>;
  totalReviews: number;
};

export async function crawl(
  category: string,
  limit: number,
  gender = "A",
  onProgress?: (msg: string) => void
): Promise<CrawlResult> {
  const log = onProgress ?? (() => {});
  const catCode = resolveCategory(category);
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15).replace(/(\d{8})(\d{6})/, "$1_$2");
  const runId = `${category}_${timestamp}`;

  // 1. 큰 풀 fetch → 재정렬
  log("랭킹 수집 중...");
  const pool: RawProduct[] = [];
  const targetPool = Math.max(limit * 4, 200);
  let page = 1;
  while (pool.length < targetPool) {
    const batch = await fetchPage(catCode, page, gender);
    if (batch.length === 0) break;
    pool.push(...batch);
    if (batch.length < 60) break;
    page++;
  }

  pool.sort((a, b) => {
    const sa = (a.reviewCount || 0) * ((a.reviewScore || 0) / 100);
    const sb = (b.reviewCount || 0) * ((b.reviewScore || 0) / 100);
    return sb - sa;
  });
  const top = pool.slice(0, limit);
  log(`${pool.length}개 중 TOP ${top.length} 선별`);

  // 2. 좋아요 일괄
  log("좋아요 수집 중...");
  const ids = top.map((p) => String(p.goodsNo));
  const likes = await fetchLikes(ids);

  // 3. 태그 + 통계 (병렬, 5개씩 청크)
  log("태그/통계 수집 중...");
  const tagMap: Record<string, string[]> = {};
  const statMap: Record<string, { pageView: number; purchaseCount: number }> = {};
  for (let i = 0; i < ids.length; i += 5) {
    const chunk = ids.slice(i, i + 5);
    const results = await Promise.all(
      chunk.map(async (id) => ({
        id,
        tags: await fetchTags(id),
        stat: await fetchStat(id),
      }))
    );
    for (const r of results) {
      tagMap[r.id] = r.tags;
      statMap[r.id] = r.stat;
    }
  }

  // 4. 리뷰 (병렬, 3개씩)
  log("리뷰 수집 중...");
  const reviewsMap: Record<string, any[]> = {};
  for (let i = 0; i < ids.length; i += 3) {
    const chunk = ids.slice(i, i + 3);
    const results = await Promise.all(chunk.map((id) => fetchReviews(id, 30)));
    chunk.forEach((id, j) => {
      reviewsMap[id] = results[j];
    });
  }
  const totalReviews = Object.values(reviewsMap).reduce((s, a) => s + a.length, 0);
  log(`리뷰 ${totalReviews}개 수집 완료`);

  // 5. 정규화
  const products = top.map((p, idx) => {
    const pid = String(p.goodsNo);
    return {
      rank: idx + 1,
      product_id: pid,
      brand: p.brandName || p.brand || "",
      brand_slug: p.brand || "",
      name: p.goodsName || "",
      price: p.price || 0,
      original_price: p.normalPrice || 0,
      discount_rate: `${p.saleRate || 0}%`,
      review_count: p.reviewCount || 0,
      review_score: p.reviewScore || 0,
      like_count: likes[pid] || 0,
      gender: p.displayGenderText || "",
      is_sold_out: p.isSoldOut || false,
      thumbnail: p.thumbnail || "",
      url: p.goodsLinkUrl || `https://www.musinsa.com/products/${pid}`,
      tags: tagMap[pid] || [],
      page_view: statMap[pid]?.pageView || 0,
      purchase_count: statMap[pid]?.purchaseCount || 0,
    };
  });

  return { runId, category, products, reviews: reviewsMap, totalReviews };
}
