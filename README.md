# 무신사 분석 대시보드 📊

실시간 무신사 패션 트렌드 분석 및 상품 모니터링 대시보드

## 🌟 주요 기능

- **📦 상품 검색**: 키워드로 무신사 상품 검색 및 크롤링
- **📂 카테고리별 크롤링**: 6개 주요 카테고리별 상품 데이터 수집
- **🔥 실시간 트렌드**: 인기 상품 TOP 5 실시간 모니터링
- **📊 데이터 분석**: 리뷰, 브랜드, 가격 분석 도구
- **📱 반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 🚀 시작하기

### 온라인으로 바로 보기
1. [GitHub Pages로 보기](https://jsky9292.github.io/musinsa/)

### 로컬에서 실행하기
```bash
# 저장소 클론
git clone https://github.com/jsky9292/musinsa.git

# 폴더 이동
cd musinsa

# 브라우저에서 열기
# index.html 파일을 더블클릭하거나
# Live Server 확장 프로그램 사용 (VS Code)
```

## 📂 프로젝트 구조

```
musinsa/
├── index.html          # 메인 대시보드 페이지
├── README.md          # 프로젝트 설명서
└── crawler/           # Python 크롤러 파일들 (선택사항)
    ├── musinsa_search_crawler.py
    ├── musinsa_top.py
    ├── musinsa_bottom.py
    └── ...
```

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design**: 반응형 웹 디자인
- **Backend**: Python 크롤러 (별도 구현 필요)

## 📱 지원 디바이스

- ✅ 데스크톱 (1920x1080 이상)
- ✅ 태블릿 (768px ~ 1024px)
- ✅ 모바일 (320px ~ 768px)

## 🎯 주요 화면

### 데스크톱 뷰
- 4개의 통계 카드를 한 줄에 표시
- 카테고리 6개를 그리드로 배치
- 사이드바에 트렌드와 도구 표시

### 모바일 뷰
- 통계 카드를 세로로 배치
- 카테고리를 2열 그리드로 변경
- 모든 섹션을 세로 스크롤로 구성

## 💡 향후 개발 예정

- [ ] 실제 크롤링 API 연동
- [ ] 데이터베이스 연동
- [ ] 실시간 업데이트 기능
- [ ] 차트 및 그래프 추가
- [ ] 사용자 로그인 기능
- [ ] 데이터 필터링 고도화

## 📄 라이선스

MIT License

## 👨‍💻 개발자

- GitHub: [@jsky9292](https://github.com/jsky9292)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 Issues 탭을 이용해주세요.

---

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!