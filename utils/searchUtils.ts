export const COFFEE_COUNTRIES = [
    "コロンビア",
    "エチオピア",
    "ブラジル",
    "グアテマラ",
    "インドネシア",
    "タンザニア",
    "ケニア",
    "コスタリカ",
    "パナマ",
    "エルサルバドル",
    "ホンジュラス",
    "ペルー",
    "ルワンダ",
    "ブルンジ",
    "ボリビア",
    "メキシコ",
    "ベトナム",
    "インド",
    "パプアニューギニア",
    "イエメン",
    "ハワイ",
    "ジャマイカ",
    "中国",
    "ミャンマー",
    "タイ",
    "ラオス"
];

/**
 * Detects if any known coffee country name is present in the input text.
 * Returns the first match found, or null if no match.
 */
export const detectCountry = (text: string): string | null => {
    if (!text) return null;
    return COFFEE_COUNTRIES.find(country => text.includes(country)) || null;
};
