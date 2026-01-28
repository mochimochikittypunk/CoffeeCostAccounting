'use client';

import React, { useState } from 'react';
import { detectCountry } from '../../utils/searchUtils';

// 型定義
type Product = {
    shop_name: string;
    product_name: string;
    price: number;
    capacity_g: number;
    unit_price: number; // 100g単価
    url: string;
};

interface CoffeePriceLabelProps {
    initialQuery?: string;
}

export const CoffeePriceLabel: React.FC<CoffeePriceLabelProps> = ({ initialQuery = '' }) => {
    const [query, setQuery] = useState(initialQuery);
    const [products, setProducts] = useState<Product[]>([]);
    const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

    // Sync query if initialQuery changes and we haven't typed? 
    // For now let's just use initialQuery as default state.
    // Actually, usually beneficial to update state if prop changes significantly, 
    // but for forms it might be annoying. Let's start with simple prop init.
    // If we want it to update when bean name changes, we should use useEffect.
    React.useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    // Detect country when query changes
    React.useEffect(() => {
        const country = detectCountry(query);
        // Only show if detected country is different from the entire query string
        // (i.e. if the user hasn't already isolated the country name)
        if (country && country !== query.trim()) {
            setDetectedCountry(country);
        } else {
            setDetectedCountry(null);
        }
    }, [query]);

    const handleSearch = async (searchQuery?: string) => {
        // If searching via button click (searchQuery is event object) or empty, use current query state
        // If searching specific text (e.g. suggestion), use that
        const targetQuery = typeof searchQuery === 'string' ? searchQuery : query;

        if (!targetQuery) return;

        // If we are searching with a specific string (like from the suggestion), update local state too
        if (typeof searchQuery === 'string' && searchQuery !== query) {
            setQuery(searchQuery);
        }

        setLoading(true);
        setSearched(true);
        try {
            // Python APIをコール
            const res = await fetch(`https://coffee-price-ai.vercel.app/search?q=${targetQuery}`);
            const data = await res.json();
            const list: Product[] = data.products || [];

            setProducts(list);

            if (list.length > 0) {
                // 中央値(median)を計算
                const sortedPrices = list.map(item => item.unit_price).sort((a, b) => a - b);
                const mid = Math.floor(sortedPrices.length / 2);
                const median = sortedPrices.length % 2 !== 0
                    ? sortedPrices[mid]
                    : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;

                setRecommendedPrice(Math.round(median));
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

    return (
        <div className="space-y-4 border p-4 rounded bg-slate-50 mt-4">
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 border rounded p-2 text-sm text-slate-900"
                        placeholder="豆の名前 (例: エチオピア)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        onClick={() => handleSearch(query)}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                        {loading ? "検索中..." : "価格調査"}
                    </button>
                </div>

                {/* Detected Country Suggestion */}
                {detectedCountry && !loading && (
                    <div className="flex items-center gap-2 animate-fadeIn">
                        <span className="text-xs text-slate-500">国名で検索:</span>
                        <button
                            onClick={() => handleSearch(detectedCountry)}
                            className="text-xs bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                            <span>🔍 {detectedCountry}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 推奨価格の提案 */}
            {recommendedPrice !== null && (
                <div className="bg-white p-4 border rounded shadow-sm text-center">
                    <p className="text-slate-500 text-xs mb-1">他ショップの中央値(参考)</p>
                    <div className="text-2xl font-bold text-slate-800">
                        ¥{recommendedPrice.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ 100g</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        対象データ数: {products.length}件
                    </p>
                </div>
            )}

            {searched && products.length === 0 && !loading && (
                <p className="text-slate-500 text-sm text-center">データが見つかりませんでした</p>
            )}
        </div>
    );
};
