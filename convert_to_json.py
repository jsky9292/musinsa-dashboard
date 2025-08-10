import pandas as pd
import json
import os

# 상위 폴더의 CSV 파일 경로
onepiece_path = '../musinsa/musinsa_onepiece_all.csv'
bottoms_path = '../musinsa/musinsa_bottoms_all.csv'

# CSV 파일 읽기
print("CSV 파일 읽는 중...")
onepiece_df = pd.read_csv(onepiece_path)
bottoms_df = pd.read_csv(bottoms_path)

# 데이터 합치기
all_products = pd.concat([onepiece_df, bottoms_df], ignore_index=True)

# JSON으로 변환
products_json = all_products.to_dict('records')

# JSON 파일 저장 (현재 폴더에)
with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(products_json, f, ensure_ascii=False, indent=2)

print(f"✅ {len(products_json)}개 상품 데이터를 products.json으로 변환 완료!")

# 간단한 통계
stats = {
    "totalProducts": len(products_json),
    "avgPrice": int(all_products['가격'].mean()),
    "avgDiscount": round(all_products['할인율'].mean(), 1),
    "totalBrands": all_products['브랜드'].nunique()
}

with open('stats.json', 'w', encoding='utf-8') as f:
    json.dump(stats, f, ensure_ascii=False, indent=2)

print("✅ 통계 데이터 저장 완료!")
print(f"   - 총 상품: {stats['totalProducts']}개")
print(f"   - 평균 가격: {stats['avgPrice']:,}원")
print(f"   - 평균 할인율: {stats['avgDiscount']}%")
print(f"   - 브랜드 수: {stats['totalBrands']}개")