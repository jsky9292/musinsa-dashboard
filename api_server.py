from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import json
import os
import pandas as pd

app = Flask(__name__)
CORS(app)  # CORS 허용 (프론트엔드 연결용)

@app.route('/api/search', methods=['POST'])
def search():
    """실시간 검색 API"""
    data = request.json
    keyword = data.get('keyword', '')
    
    # 크롤러 실행
    result = subprocess.run(
        ['python', '../musinsa/musinsa_search_crawler.py', keyword],
        capture_output=True,
        text=True
    )
    
    # 결과 파일 읽기
    if os.path.exists('search_results.csv'):
        df = pd.read_csv('search_results.csv')
        return jsonify(df.to_dict('records'))
    
    return jsonify({'error': 'No results'}), 404

@app.route('/api/products', methods=['GET'])
def get_products():
    """저장된 상품 데이터 반환"""
    products = []
    
    # CSV 파일들 읽기
    csv_files = [
        '../musinsa/musinsa_onepiece_all.csv',
        '../musinsa/musinsa_bottoms_all.csv'
    ]
    
    for file in csv_files:
        if os.path.exists(file):
            df = pd.read_csv(file)
            products.extend(df.to_dict('records'))
    
    return jsonify(products)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """통계 데이터 반환"""
    
    # 모든 데이터 로드
    all_data = []
    for file in ['../musinsa/musinsa_onepiece_all.csv', '../musinsa/musinsa_bottoms_all.csv']:
        if os.path.exists(file):
            df = pd.read_csv(file)
            all_data.append(df)
    
    if all_data:
        combined = pd.concat(all_data)
        stats = {
            'totalProducts': len(combined),
            'avgPrice': int(combined['가격'].mean()),
            'avgDiscount': round(combined['할인율'].mean(), 1),
            'totalBrands': combined['브랜드'].nunique()
        }
        return jsonify(stats)
    
    return jsonify({'error': 'No data'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)