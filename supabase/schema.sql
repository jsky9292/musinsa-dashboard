-- 무신사 경쟁분석 Supabase 스키마
-- Supabase SQL Editor에서 실행

create table if not exists runs (
  id text primary key,                  -- 예: 반팔티셔츠_20260408_135220
  category text not null,
  collected_at timestamptz default now(),
  total_products int default 0,
  total_reviews int default 0
);

create table if not exists products (
  run_id text references runs(id) on delete cascade,
  product_id text not null,
  rank int,
  brand text,
  brand_slug text,
  name text,
  price int,
  original_price int,
  discount_rate text,
  review_count int default 0,
  review_score int default 0,
  like_count int default 0,
  gender text,
  thumbnail text,
  url text,
  tags jsonb default '[]'::jsonb,
  page_view int default 0,
  purchase_count int default 0,
  primary key (run_id, product_id)
);

create index if not exists products_run_rank on products(run_id, rank);
create index if not exists products_brand on products(brand);

create table if not exists reviews (
  id bigserial primary key,
  run_id text references runs(id) on delete cascade,
  product_id text not null,
  rating int,
  text text,
  option text,
  helpful int default 0,
  date text,
  height int,
  weight int
);

create index if not exists reviews_run_pid on reviews(run_id, product_id);

create table if not exists branding (
  run_id text primary key references runs(id) on delete cascade,
  positioning_statement text,
  market_gap jsonb,
  differentiator_keywords jsonb,
  copy_directions jsonb,
  target_pain_points jsonb,
  pricing_insight text,
  must_have_features jsonb,
  avoid_pitfalls jsonb,
  created_at timestamptz default now()
);

create table if not exists analyses (
  id bigserial primary key,
  run_id text references runs(id) on delete cascade,
  product_id text not null,
  rank int,
  review_analysis jsonb,
  unique (run_id, product_id)
);

-- RLS 비활성 (서비스 키로만 접근, 또는 익명 read 허용)
alter table runs enable row level security;
alter table products enable row level security;
alter table reviews enable row level security;
alter table branding enable row level security;
alter table analyses enable row level security;

-- 익명 read 허용 (대시보드 공개용)
create policy "public read runs" on runs for select using (true);
create policy "public read products" on products for select using (true);
create policy "public read reviews" on reviews for select using (true);
create policy "public read branding" on branding for select using (true);
create policy "public read analyses" on analyses for select using (true);
