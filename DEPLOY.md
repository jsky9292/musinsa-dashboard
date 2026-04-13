# 배포 가이드

## 0. 로컬 확인
```
http://localhost:3100
```
관리자: `admin` / `admin123` (HTTP Basic Auth, env로 변경 가능)

---

## 1. Supabase 프로젝트 생성

1. https://supabase.com → New project
2. 프로젝트 이름: `musinsa-dashboard` (자유)
3. DB 비밀번호 설정 (메모해둘 것)
4. 리전: `Northeast Asia (Seoul)` 권장
5. 생성 후 **Settings → API** 에서 다음 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ 비밀

## 2. 스키마 생성

Supabase **SQL Editor** → New query → 아래 파일 내용 붙여넣기 → Run
```
web/supabase/schema.sql
```
runs / products / reviews / branding / analyses 5개 테이블 생성됩니다.

## 3. 로컬 데이터를 Supabase로 마이그레이션

```bash
cd web
cp .env.example .env.local
# .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY 채우기
npm run migrate
```

`output/*.json` 의 모든 run이 Supabase에 업로드됩니다.

---

## 4. GitHub Private Repo 생성

```bash
cd web
git init
git add .
git commit -m "init: musinsa dashboard"

# GitHub CLI로 private repo 생성 (gh가 설치돼 있어야 함)
gh repo create musinsa-dashboard --private --source=. --remote=origin --push
```

또는 GitHub 웹에서 New repository → Private 체크 후:
```bash
git remote add origin https://github.com/<유저명>/musinsa-dashboard.git
git branch -M main
git push -u origin main
```

## 5. Vercel 배포

1. https://vercel.com → Add New → Project
2. GitHub repo 선택 (Private repo도 그대로 import 가능)
3. **Root Directory**: 그대로 (web 디렉토리만 push했으면 root)
4. **Environment Variables** 입력:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ADMIN_USER=admin
   ADMIN_PASS=admin123
   ```
5. Deploy 클릭

배포 완료 후 받은 URL (`https://musinsa-dashboard.vercel.app`)로 접속하면 admin / admin123 로그인 프롬프트가 뜹니다.

---

## 6. 추가 데이터 수집

크롤러는 **로컬에서만** 동작합니다 (Vercel은 Python 못 돌림).

```bash
# 로컬에서 새 카테고리 수집
cd ..
python main.py --category 후드티 --limit 50

# Supabase로 푸시
cd web
npm run migrate
```

배포된 사이트는 자동으로 새 데이터를 보여줍니다 (Vercel ISR/Server Components).

---

## 환경변수 요약

| 변수 | 어디서 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API | DB 주소 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API | 익명 read |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API | 쓰기 (마이그레이션, AI 저장) |
| `ADMIN_USER` | 임의 | Basic Auth 사용자명 (기본 admin) |
| `ADMIN_PASS` | 임의 | Basic Auth 비밀번호 (기본 admin123) |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey | AI 인사이트 (사이드바 입력도 가능) |
