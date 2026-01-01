import streamlit as st
import pandas as pd
import math

# --- 1. 定数設定 ---
LOSS_RATE = 0.20  # 焙煎による重量目減り率 20%
SALES_UNIT_G = 100  # 販売単位 100g
TAX_RATE = 0.08   # 消費税率 8% (軽減税率)
PLATFORM_FEE_RATE = 0.10 # プラットフォーム手数料 10%

def main():
    st.set_page_config(page_title="自家焙煎コーヒー豆 収益シミュレーター", layout="wide")
    
    st.title("☕ 自家焙煎コーヒー豆 価格設定＆収益シミュレーター")
    st.markdown("""
    仕入れ価格や目標原価率を入力することで、最適な販売価格と損益分岐点をシミュレーションできるツールです。
    最大5種類の豆を同時に比較・計算できます。
    """)
    st.markdown("---")

    # --- 2. 入力エリア ---
    st.subheader("📝 豆情報の入力")
    st.caption("最大5種類の豆情報を入力してください。")

    beans_data = []
    
    # 5つの入力フォームを配置
    # 視認性を良くするため、Expanderを使用
    for i in range(5):
        # 1つ目はデフォルトで開いておく
        with st.expander(f"豆 No.{i+1}", expanded=(i==0)):
            c1, c2, c3 = st.columns([2, 1, 1])
            with c1:
                name = st.text_input(f"豆の名称", key=f"name_{i}", placeholder="例: エチオピア イルガチェフェ")
            with c2:
                price_in = st.number_input(f"仕入れ価格 (税込・総額) [円]", min_value=0, step=100, key=f"price_{i}", help="送料等を含んだ総仕入れコスト")
            with c3:
                weight_in_kg = st.number_input(f"仕入れ重量 [kg]", min_value=0.0, step=0.1, format="%.2f", key=f"weight_{i}", help="生豆の重量")
            
            c4, c5 = st.columns(2)
            with c4:
                target_rate_retail = st.number_input(f"目標原価率 (通常小売) [%]", min_value=1.0, max_value=100.0, value=30.0, step=1.0, key=f"rate_retail_{i}")
            with c5:
                target_rate_wholesale = st.number_input(f"目標原価率 (卸売) [%]", min_value=1.0, max_value=100.0, value=50.0, step=1.0, key=f"rate_wholesale_{i}")

            # 入力が有効な場合のみリストに追加
            if name and price_in > 0 and weight_in_kg > 0:
                beans_data.append({
                    "id": i,
                    "name": name,
                    "purchase_price": price_in,
                    "purchase_weight_kg": weight_in_kg,
                    "target_rate_retail": target_rate_retail,
                    "target_rate_wholesale": target_rate_wholesale
                })

    # --- 3. 計算ロジック ---
    if not beans_data:
        st.info("👆 上記のフォームに豆の情報を入力すると、ここに計算結果が表示されます。")
        return

    results = []
    total_purchase_price = 0
    total_expected_profit = 0

    for bean in beans_data:
        # 1. 焙煎後重量 (g)
        roasted_weight_g = bean["purchase_weight_kg"] * 1000 * (1 - LOSS_RATE)
        
        # 2. 販売可能ユニット数 (袋) 
        # "焙煎後重量 / 100g"。物理的な袋数なので切り捨て(floor)とします。
        sellable_units = math.floor(roasted_weight_g / SALES_UNIT_G)
        
        if sellable_units <= 0:
             # 計算不能な場合はスキップ（通常入力制限で弾かれるが念のため）
             continue
             
        # 3. 1袋あたり原価 (円)
        cost_per_bag = bean["purchase_price"] / sellable_units
        
        # 4. 推奨販売価格 (通常小売・税込) (円)
        # 1袋あたり原価 / (目標原価率 / 100) -> 10円単位で切り上げ
        price_retail_raw = cost_per_bag / (bean["target_rate_retail"] / 100)
        price_retail = math.ceil(price_retail_raw / 10) * 10
        
        # 5. 推奨販売価格 (卸売・税込) (円)
        price_wholesale_raw = cost_per_bag / (bean["target_rate_wholesale"] / 100)
        price_wholesale = math.ceil(price_wholesale_raw / 10) * 10
        
        # 6. 損益分岐点 (回収率) (%)
        # (仕入れ価格 / 通常小売価格) / 販売可能ユニット数 * 100
        breakeven_rate = (bean["purchase_price"] / price_retail) / sellable_units * 100
        
        # 7. 期待利益総額 (円)
        # (通常小売価格 * 販売可能ユニット数 * (1 - 手数料率)) - 仕入れ価格
        expected_profit = (price_retail * sellable_units * (1 - PLATFORM_FEE_RATE)) - bean["purchase_price"]
        
        # 消費税額（参考表示用・内税）
        tax_amount_retail = price_retail * TAX_RATE / (1 + TAX_RATE)

        results.append({
            "No": bean["id"] + 1,
            "豆の名称": bean["name"],
            "仕入れ価格": int(bean["purchase_price"]),
            "仕入れ重量(kg)": bean["purchase_weight_kg"],
            "焙煎後重量(g)": int(roasted_weight_g),
            "販売可能数(袋)": int(sellable_units),
            "1袋原価(円)": int(round(cost_per_bag)),
            "推奨売価(小売)(税込)": int(price_retail),
            "推奨売価(卸売)(税込)": int(price_wholesale),
            "損益分岐点(%)": round(breakeven_rate, 1),
            "期待利益(円)": int(round(expected_profit)),
            "うち消費税(小売)(円)": int(round(tax_amount_retail))
        })
        
        total_purchase_price += bean["purchase_price"]
        total_expected_profit += expected_profit

    # --- 4. UI/UX 表示モード切替 ---
    st.markdown("---")
    st.header("📊 シミュレーション結果")
    
    # モード切替
    view_mode = st.radio("表示モード", ["PCモード (一覧表)", "モバイルモード (カード)"], horizontal=True)

    df = pd.DataFrame(results)

    if view_mode == "PCモード (一覧表)":
        # データフレーム表示
        # カラム順序の整理
        display_cols = [
            "豆の名称", "推奨売価(小売)(税込)", "推奨売価(卸売)(税込)", 
            "期待利益(円)", "損益分岐点(%)", 
            "販売可能数(袋)", "1袋原価(円)", "うち消費税(小売)(円)"
        ]
        
        st.dataframe(
            df[display_cols].style.format({
                "推奨売価(小売)(税込)": "{:,} 円",
                "推奨売価(卸売)(税込)": "{:,} 円",
                "期待利益(円)": "{:,} 円",
                "1袋原価(円)": "{:,} 円",
                "うち消費税(小売)(円)": "{:,} 円",
                "損益分岐点(%)": "{:.1f} %",
                "販売可能数(袋)": "{:,} 袋"
            }), 
            use_container_width=True,
            height=(len(df) + 1) * 35 + 3
        )
        
        # ポイントサマリー（PC版）
        st.write("")
        col_sum1, col_sum2 = st.columns(2)
        col_sum1.metric("📦 全種類の合計仕入れ額", f"{int(total_purchase_price):,} 円")
        col_sum2.metric("💰 全種類の合計期待利益", f"{int(total_expected_profit):,} 円")

    else:
        # モバイル（カード）表示
        st.caption("スマートフォンで見やすいカード形式です。")
        
        for index, row in df.iterrows():
            with st.container():
                st.markdown(f"#### ☕ {row['豆の名称']}")
                
                # 推奨価格を強調表示するためのカスタムHTML
                st.markdown(
                    f"""
                    <div style="
                        background-color: #e0f7fa; 
                        padding: 15px; 
                        border-radius: 8px; 
                        text-align: center; 
                        border: 1px solid #b2ebf2;
                        margin-bottom: 12px;
                        color: #006064;
                    ">
                        <div style="font-size: 0.85rem; color: #00838f;">推奨販売価格 (通常小売・税込)</div>
                        <div style="font-size: 1.8rem; font-weight: bold;">{int(row['推奨売価(小売)(税込)']):,} 円</div>
                    </div>
                    """, 
                    unsafe_allow_html=True
                )
                
                # 詳細情報グリッド
                m1, m2 = st.columns(2)
                m1.write(f"**卸売価格**: {int(row['推奨売価(卸売)(税込)']):,} 円")
                m2.write(f"**期待利益**: {int(row['期待利益(円)']):,} 円")
                
                m3, m4 = st.columns(2)
                m3.write(f"**原価/袋**: {int(row['1袋原価(円)']):,} 円")
                m4.write(f"**販売数**: {int(row['販売可能数(袋)']):,} 袋")
                
                st.write(f"**損益分岐点(回収率)**: {row['損益分岐点(%)']:.1f} %")
                
                st.divider()

        # 全体サマリー（モバイル版）
        st.subheader("合計サマリー")
        s1, s2 = st.columns(2)
        s1.metric("合計仕入れ", f"{int(total_purchase_price):,} 円")
        s2.metric("合計利益", f"{int(total_expected_profit):,} 円")

if __name__ == "__main__":
    main()
