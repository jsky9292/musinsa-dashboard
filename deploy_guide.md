# 🚀 무신사 대시보드 배포 가이드

## 방법 1: GitHub Pages (정적 사이트) ⭐추천

### 1. 데이터 준비
```bash
# CSV를 JSON으로 변환
cd musinsa-dashboard
python convert_to_json.py
```

### 2. 파일 구조
```
musinsa-dashboard/
├── index.html (index_v2.html을 index.html로 이름 변경)
├── products.json
├── stats.json
└── convert_to_json.py
```

### 3. GitHub에 푸시
```bash
cd musinsa-dashboard
git init
git add .
git commit -m "Add dashboard with data"
git remote add origin https://github.com/USERNAME/musinsa-dashboard.git
git push -u origin main
```

### 4. GitHub Pages 활성화
1. GitHub 저장소 → Settings
2. Pages 섹션
3. Source: Deploy from a branch
4. Branch: main, folder: / (root)
5. Save

### 5. 접속
- https://USERNAME.github.io/musinsa-dashboard/

---

## 방법 2: Vercel/Netlify (무료 호스팅)

### Vercel 배포
1. [vercel.com](https://vercel.com) 가입
2. Import Git Repository
3. musinsa-dashboard 선택
4. Deploy

### Netlify 배포
1. [netlify.com](https://netlify.com) 가입
2. Sites → Import from Git
3. musinsa-dashboard 선택
4. Deploy site

---

## 방법 3: 실시간 API 서버 (Heroku/Railway)

### 필요 파일
- api_server.py
- requirements.txt
- Procfile

### requirements.txt
```
flask
flask-cors
pandas
```

### Procfile
```
web: gunicorn api_server:app
```

### 배포
1. Heroku/Railway 가입
2. 새 프로젝트 생성
3. GitHub 연결
4. 자동 배포

---

## 🎯 추천 방법

**간단한 대시보드**: GitHub Pages (무료, 쉬움)
**실시간 크롤링**: Vercel + Serverless Functions
**풀스택 앱**: Railway/Render (백엔드) + Vercel (프론트엔드)