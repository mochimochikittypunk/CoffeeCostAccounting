# Coffee Price API Integration Guide (for Next.js)

このガイドは、開発中の価格シミュレーションアプリ (Next.js) に、今回作成した「価格市場調査機能」をAPIとして統合する手順書です。

## アーキテクチャ

```mermaid
graph LR
    User -->|入力: "エチオピア"| NextJS[Next.js App :3000]
    NextJS -->|GET /search?q=エチオピア| PyAPI[Python API :8000]
    PyAPI -->|Read| JSON[data/products.json]
    PyAPI -->|Return Results| NextJS
    NextJS -->|Suggest| User
```

---

## 手順 1: Python API の準備 (サーバー側)

今回作成したプロジェクト内に `api.py` を用意しました。これを起動して API サーバーにします。

### 1. 必要なライブラリのインストール
```bash
pip install fastapi uvicorn
```

### 2. APIサーバーの起動
```bash
python api.py
```
→ `http://localhost:8000/search?q=エチオピア` にアクセスして JSON が返ってくれば成功です。

---

## 手順 2: Next.js でのフロントエンド実装

「Bean 1」の入力欄を、オートコンプリート（サジェスト）付きのコンポーネントにアップグレードします。

### サンプルコード: `components/CoffeePriceLabel.tsx`

```tsx
import { useState } from 'react';

// 型定義
type Product = {
  shop_name: string;
  product_name: string;
  price: number;
  capacity_g: number;
  unit_price: number; // 100g単価
  url: string;
};

export default function CoffeePriceLabel() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Python APIをコール
      const res = await fetch(`http://localhost:8000/search?q=${query}`);
      const data = await res.json();
      const list: Product[] = data.products || [];
      
      setProducts(list);

      if (list.length > 0) {
        // 平均単価(100gあたり)を計算
        const total = list.reduce((sum, item) => sum + item.unit_price, 0);
        const avg = Math.round(total / list.length);
        setRecommendedPrice(avg);
      } else {
        setRecommendedPrice(null);
      }
    } catch (e) {
      console.error(e);
      alert("APIとの通信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const openList = () => {
    // データ一覧を別ウィンドウで表示 (簡易的な実装)
    const jsonTab = window.open("", "_blank");
    jsonTab?.document.write("<pre>" + JSON.stringify(products, null, 2) + "</pre>");
  };

  return (
    <div className="space-y-4 border p-4 rounded bg-gray-50 max-w-lg">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          placeholder="豆の名前 (例: エチオピア)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "検索中..." : "価格調査"}
        </button>
      </div>

      {/* 推奨価格の提案 */}
      {recommendedPrice !== null && (
        <div className="bg-white p-4 border rounded shadow-sm text-center">
          <p className="text-gray-500 text-sm mb-1">市場平均価格 (推奨)</p>
          <div className="text-3xl font-bold text-gray-800">
            ¥{recommendedPrice} <span className="text-lg font-normal text-gray-500">/ 100g</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            対象データ数: {products.length}件
          </p>
          
          <button 
            onClick={openList}
            className="text-blue-500 text-sm underline mt-3 hover:text-blue-700"
          >
            詳細リストを確認 (別タブ)
          </button>
          
          <button
            onClick={() => alert(`¥${recommendedPrice} を原価に適用しました`)}
            className="mt-3 bg-green-500 text-white w-full py-2 rounded font-bold"
          >
            この価格を適用する
          </button>
        </div>
      )}
      
      {products.length === 0 && !loading && selected && (
        <p className="text-gray-500 text-center">データが見つかりませんでした</p>
      )}
    </div>
  );
}
```

## ポイント
1.  **検索ボタン:** ワンクリックでAPIを叩きに行きます。
2.  **平均価格の算出:** 取得した全データの `unit_price` (100g単価) の平均値をフロントエンドで計算し、`recommendedPrice` として表示します。
3.  **リスト確認:** `window.open` を使って、取得した生のデータを別タブで確認できるようにしています（実運用ではモーダル等にしてもOK）。
