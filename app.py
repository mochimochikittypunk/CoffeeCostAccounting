import streamlit as st
import pandas as pd
import math
import streamlit_shadcn_ui as ui

# --- 1. 定数設定 ---
LOSS_RATE = 0.20  # 焙煎による重量目減り率 20%
# SALES_UNIT_G is now dynamic
TAX_RATE = 0.08   # 消費税率 8% (軽減税率)
DEFAULT_PLATFORM_FEE_RATE = 0.10 # プラットフォーム手数料 10%

def main():
    st.set_page_config(page_title="自家焙煎コーヒー豆 収益シミュレーター", layout="wide", page_icon="☕")

    # --- Custom CSS for Shadcn/Modern Look ---
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        html, body, [class*="css"]  {
            font-family: 'Inter', sans-serif;
        }
        
        /* Clean white background */
        .stApp {
            background-color: #ffffff;
            color: #0f172a;
        }

        /* Metric Styling Adjustment */
        .stMetric {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px;
        }
        
        /* Input Fields */
        .stTextInput input, .stNumberInput input {
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        /* Mobile Card Styling */
        .bean-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .bean-card-header {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }
        
        .price-tag {
            background-color: #e0f2fe; 
            color: #0369a1;
            padding: 12px;
            border-radius: 6px;
            text-align: center;
            margin: 10px 0;
            border: 1px solid #bae6fd;
        }
        
        .price-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #0284c7;
        }
        
        .price-value {
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 16px 0;
        }
        
        .grid-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 0.875rem;
        }
        
        .info-item-label {
            color: #64748b;
        }
        .info-item-value {
            font-weight: 500;
            color: #334155;
        }

        /* Status Badges */
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .status-safe { background-color: #dcfce7; color: #166534; }
        .status-warning { background-color: #fef9c3; color: #854d0e; }
        .status-danger { background-color: #fee2e2; color: #991b1b; }
        </style>
    """, unsafe_allow_html=True)

    # --- Sidebar Settings ---
    st.sidebar.title("⚙️ 設定")
    sales_unit_g = st.sidebar.number_input(
        "基本販売単位 (g)", 
        min_value=10, 
        max_value=500, 
        value=100, 
        step=10,
        help="計算の基準となる1袋あたりのグラム数です（デフォルト: 100g）"
    )

    # Layout: Title on Left, Donation on Right
    col_header, col_donate = st.columns([3, 1])
    
    with col_header:
        st.title("☕ 自家焙煎コーヒー豆 収益シミュレーター")
    
    with col_donate:
        st.write("") # Adjust vertical alignment
        st.link_button("🎁 開発を応援する！", "https://square.link/u/CYYWh8wX", help="寄付ページへ移動します")
        st.caption("開発者のAI重課金を救おう！")

    
    with st.expander("ℹ️ このツールについて", expanded=False):
        st.write("""
        コーヒー豆の価格設定と利益シミュレーションを行います。生豆の価格、量、原価目標を入力してください。
        """)

    # --- Initialize Persistent Store ---
    if 'bean_store' not in st.session_state:
        st.session_state['bean_store'] = [
            {
                "name": "",
                "purchase_price": 0,
                "purchase_weight_kg": 0.0,
                "target_rate_retail": 30,
                "target_rate_wholesale": 50
            }
            for _ in range(5)
        ]

    # --- 2. Input Area (Styled) ---
    st.write("### 📝 豆情報の入力")
    
    # Platform Fee Toggle
    use_platform_fee = st.toggle("プラットフォーム手数料 (10%) を適用する", value=True)
    current_fee_rate = DEFAULT_PLATFORM_FEE_RATE if use_platform_fee else 0.0
    
    # Tabs for beans
    tabs = ui.tabs(options=["豆 1", "豆 2", "豆 3", "豆 4", "豆 5"], default_value="豆 1", key="bean_tabs")
    current_idx = int(tabs.split(" ")[1]) - 1

    # Access current bean data from store
    current_bean_data = st.session_state['bean_store'][current_idx]

    with st.container():
        st.caption(f"豆 No.{current_idx + 1} の設定")
        c1, c2, c3 = st.columns([2, 1, 1])
        with c1:
            new_name = st.text_input(
                f"豆の名称", 
                value=current_bean_data["name"], 
                key=f"name_{current_idx}", 
                placeholder="例: エチオピア イルガチェフェ"
            )
            st.session_state['bean_store'][current_idx]["name"] = new_name

        with c2:
            new_price = st.number_input(
                f"仕入れ価格 (税込) [円]", 
                min_value=0, 
                step=100, 
                value=current_bean_data["purchase_price"],
                key=f"price_{current_idx}"
            )
            st.session_state['bean_store'][current_idx]["purchase_price"] = new_price

        with c3:
            new_weight = st.number_input(
                f"仕入れ重量 [kg]", 
                min_value=0.0, 
                step=0.1, 
                format="%.2f", 
                value=current_bean_data["purchase_weight_kg"],
                key=f"weight_{current_idx}"
            )
            st.session_state['bean_store'][current_idx]["purchase_weight_kg"] = new_weight
        
        c4, c5 = st.columns(2)
        with c4:
            new_rr = st.slider(
                f"目標原価率 (小売) [%]", 
                10, 80, 
                value=current_bean_data["target_rate_retail"], 
                key=f"rate_retail_{current_idx}"
            )
            st.session_state['bean_store'][current_idx]["target_rate_retail"] = new_rr

        with c5:
            new_rw = st.slider(
                f"目標原価率 (卸売) [%]", 
                10, 80, 
                value=current_bean_data["target_rate_wholesale"], 
                key=f"rate_wholesale_{current_idx}"
            )
            st.session_state['bean_store'][current_idx]["target_rate_wholesale"] = new_rw

    # --- 3. Calculation Logic ---
    results = []
    total_purchase = 0
    total_profit = 0
    
    active_beans = []
    for i, bean_data in enumerate(st.session_state['bean_store']):
        if bean_data["name"] and bean_data["purchase_price"] > 0 and bean_data["purchase_weight_kg"] > 0:
             active_beans.append(bean_data)

    if not active_beans:
        st.info("👆 上記のフォームに豆の情報を入力してください。")
    
    for bean in active_beans:
        roasted_weight_g = bean["purchase_weight_kg"] * 1000 * (1 - LOSS_RATE)
        # Use Dynamic Sales Unit
        sellable_units = math.floor(roasted_weight_g / sales_unit_g)
        if sellable_units <= 0: continue
        
        cost_per_bag = bean["purchase_price"] / sellable_units
        
        # Retail Price
        price_retail_raw = cost_per_bag / (bean["target_rate_retail"] / 100)
        price_retail = math.ceil(price_retail_raw / 10) * 10
        
        # Wholesale Price
        price_wholesale_raw = cost_per_bag / (bean["target_rate_wholesale"] / 100)
        price_wholesale = math.ceil(price_wholesale_raw / 10) * 10
        
        # Breakeven Units
        revenue_per_bag = price_retail * (1 - current_fee_rate)
        if revenue_per_bag > 0:
            breakeven_units = math.ceil(bean["purchase_price"] / revenue_per_bag)
        else:
            breakeven_units = 999999 

        expected_profit = (price_retail * sellable_units * (1 - current_fee_rate)) - bean["purchase_price"]
        
        results.append({
            "name": bean["name"],
            "retail_price": int(price_retail),
            "wholesale_price": int(price_wholesale),
            "profit": int(expected_profit),
            "cost_per_bag": int(cost_per_bag),
            "units": int(sellable_units),
            "breakeven_units": int(breakeven_units),
            "raw_data": bean # Store raw data for advanced sim
        })
        
        total_purchase += bean["purchase_price"]
        total_profit += expected_profit

    # --- 4. Results UI ---
    st.markdown("---")
    st.write("### 📊 シミュレーション結果")
    
    view_mode = ui.tabs(options=["カード表示 (Mobile)", "一覧表 (PC)"], default_value="カード表示 (Mobile)", key="view_tabs")

    # Global Metrics using Shadcn Cards
    m1, m2, m3 = st.columns(3)
    with m1:
        ui.metric_card(title="合計仕入れ", content=f"{int(total_purchase):,} 円", description="生豆の仕入れ総額", key="card1")
    with m2:
        ui.metric_card(title="期待利益総額", content=f"{int(total_profit):,} 円", description="諸経費を引いた利益", key="card2")
    with m3:
        roi = (total_profit / total_purchase * 100) if total_purchase > 0 else 0
        ui.metric_card(title="ROI (投資対効果)", content=f"{roi:.1f} %", description="仕入れに対する利益率", key="card3")

    st.write("") # Spacer

    if view_mode == "一覧表 (PC)":
        if results:
            st.caption(f"※現在の販売単位: {sales_unit_g}g / 袋")
            display_data = []
            for r in results:
                display_data.append({
                    "豆の名称": r["name"],
                    "推奨売価(小売)": f"{r['retail_price']:,} 円",
                    "推奨売価(卸売)": f"{r['wholesale_price']:,} 円",
                    "利益": f"{r['profit']:,} 円",
                    "原価/袋": f"{r['cost_per_bag']:,} 円",
                    "販売数(袋)": f"{r['units']:,}",
                    "損益分岐点(販売数)": f"{r['breakeven_units']} 袋"
                })
            
            df_display = pd.DataFrame(display_data)
            ui.table(data=df_display, maxHeight=400)
        else:
            st.write("データがありません。")

    else: # Card View
        if not results:
            st.write("データがありません。")
        
        st.caption(f"※現在の販売単位: {sales_unit_g}g / 袋")
        for r in results:
            be_color = '#ef4444' if r['breakeven_units'] > r['units'] else '#22c55e'
            
            html_content = (
                f'<div class="bean-card">'
                f'<div class="bean-card-header"><span>☕ {r["name"]}</span></div>'
                f'<div class="price-tag">'
                f'<div class="price-label">推奨販売価格 (通常小売)</div>'
                f'<div class="price-value">¥ {r["retail_price"]:,}</div>'
                f'</div>'
                f'<div class="grid-info">'
                f'<div><span class="info-item-label">卸売価格</span></div>'
                f'<div style="text-align:right"><span class="info-item-value">¥ {r["wholesale_price"]:,}</span></div>'
                f'<div><span class="info-item-label">利益</span></div>'
                f'<div style="text-align:right"><span class="info-item-value">¥ {r["profit"]:,}</span></div>'
                f'<div><span class="info-item-label">原価/袋</span></div>'
                f'<div style="text-align:right"><span class="info-item-value">¥ {r["cost_per_bag"]:,}</span></div>'
                f'<div><span class="info-item-label">販売可能数</span></div>'
                f'<div style="text-align:right"><span class="info-item-value">{r["units"]:,} 袋</span></div>'
                f'</div>'
                f'<div class="divider"></div>'
                f'<div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b;">'
                f'<span>損益分岐点 (販売数)</span>'
                f'<span style="font-weight:600; color:{be_color}">{r["breakeven_units"]} 袋</span>'
                f'</div>'
                f'</div>'
            )
            st.markdown(html_content, unsafe_allow_html=True)

    # --- 5. Advanced Feature: Volume Discount Simulator ---
    if results:
        st.markdown("---")
        st.write("### 📉 割引・大袋シミュレーター")
        st.caption("ボリュームディスカウントや大袋販売時の利益構造を分析します。")

        with st.container():
            col_sim_1, col_sim_2 = st.columns([1, 2])
            
            with col_sim_1:
                # Inputs
                bean_names = [r["name"] for r in results]
                selected_bean_name = st.selectbox("分析対象の豆", bean_names)
                
                # Retrieve selected bean data
                target_bean = next((r for r in results if r["name"] == selected_bean_name), results[0])
                
                big_bag_g = st.slider("大袋サイズ (g)", min_value=100, max_value=1000, value=200, step=100)
                discount_rate_percent = st.slider("割引率 (%)", 0, 50, 0, step=5)
                discount_rate = discount_rate_percent / 100.0

                # Calculations
                base_price_per_g = target_bean["retail_price"] / sales_unit_g
                
                # Scaled Price (Before Discount)
                scaled_retail_price_raw = base_price_per_g * big_bag_g
                # Apply Discount & Round Up
                discounted_price_raw = scaled_retail_price_raw * (1 - discount_rate)
                final_price = math.ceil(discounted_price_raw / 10) * 10
                
                # Cost Calculation
                base_cost_per_g = target_bean["cost_per_bag"] / sales_unit_g
                bag_cost = base_cost_per_g * big_bag_g
                
                # Fee
                fee = final_price * current_fee_rate
                
                # Profit
                profit_per_bag = final_price - bag_cost - fee
                profit_rate = (profit_per_bag + fee + bag_cost) # Just sales price? No, profit rate = (Sales - Cost) / Sales usually?
                # User requirements: Safe if > Wholesale Target Rate
                # Wholesale Target logic: 
                #   Price = Cost / (TargetRate / 100)
                #   => Cost / Price = TargetRate / 100
                #   => (1 - ProfitMargin) ? No. "Cost Ratio" is Cost/Price.
                # Let's interpret "Target Rate" as Cost Ratio (Genkaritsu).
                # Safe if current Cost Ratio < Wholesale Cost Ratio (meaning better margin)
                # Or Safe if Profit Margin > (1 - Wholesale Cost Ratio)
                
                current_genka_rate = (bag_cost / final_price * 100) if final_price > 0 else 100
                target_wholesale_rate = target_bean["raw_data"]["target_rate_wholesale"]
                
                # Status Logic
                # Safe: Current Genka Rate <= Target Wholesale Rate (Better or Equal Margin)
                # Warning: Current Genka Rate > Target Wholsale Rate BUT Profit > 0
                # Danger: Profit <= 0
                
                status_html = ""
                if profit_per_bag < 0:
                    status_html = '<span class="status-badge status-danger">🔴 赤字 (Danger)</span>'
                elif current_genka_rate <= target_wholesale_rate:
                    status_html = '<span class="status-badge status-safe">🟢 安全圏 (Safe)</span>'
                else:
                    status_html = '<span class="status-badge status-warning">🟡 注意 (Warning)</span>'


                st.markdown(f"""
                <div style="background-color:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0; margin-top:20px;">
                    <div style="font-size:0.9rem; color:#64748b; margin-bottom:5px;">販売設定: {big_bag_g}g / {discount_rate_percent}% OFF</div>
                    <div style="font-size:1.8rem; font-weight:bold; color:#0f172a; margin-bottom:10px;">{final_price:,} 円 <span style="font-size:1rem; font-weight:normal; color:#64748b;">(税込)</span></div>
                    <div style="margin-bottom:10px;">{status_html}</div>
                    <div style="font-size:0.9rem;">
                        <div>想定利益: <b>{int(profit_per_bag):,} 円</b></div>
                        <div>原価率: {current_genka_rate:.1f}% <span style="color:#94a3b8; font-size:0.8rem;">(卸売目標: {target_wholesale_rate}%)</span></div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            
            with col_sim_2:
                # Chart Generation
                # X: Discount Rate 0-50, Y: Profit
                chart_data = []
                for d in range(0, 51, 5): # 0, 5, 10 ... 50
                    rate = d / 100.0
                    p_raw = scaled_retail_price_raw * (1 - rate)
                    p_final = math.ceil(p_raw / 10) * 10
                    fee_val = p_final * current_fee_rate
                    prof = p_final - bag_cost - fee_val
                    chart_data.append({"Discount (%)": d, "Profit (JPY)": int(prof)})
                
                df_chart = pd.DataFrame(chart_data)
                
                # Reference Lines
                # Wholesale Profit Line (Profit if sold at wholesale rate logic)
                # Wholesale Price for Big Bag
                wholesale_price_raw = (bag_cost / (target_wholesale_rate / 100))
                wholesale_price = math.ceil(wholesale_price_raw / 10) * 10
                wholesale_profit = wholesale_price - bag_cost - (wholesale_price * current_fee_rate)
                
                st.write("#### 📉 割引率と利益の推移")
                
                # Using Altair specifically allows for reference lines easily, 
                # but st.line_chart is simpler. User asked to "Add reference lines".
                # st.line_chart doesn't support adding lines easily.
                # Let's use Altair for custom lines.
                import altair as alt
                
                base_chart = alt.Chart(df_chart).mark_line(point=True).encode(
                    x=alt.X("Discount (%):Q", scale=alt.Scale(domain=[0, 50])),
                    y=alt.Y("Profit (JPY):Q"),
                    tooltip=["Discount (%)", "Profit (JPY)"]
                )
                
                zero_rule = alt.Chart(pd.DataFrame({'y': [0]})).mark_rule(color='red', strokeDash=[3,3]).encode(y='y')
                wholesale_rule = alt.Chart(pd.DataFrame({'y': [wholesale_profit]})).mark_rule(color='orange', strokeDash=[5,5]).encode(
                    y='y', 
                    tooltip=alt.value(f"Wholesale Profit Line: {int(wholesale_profit)} JPY")
                )

                lbl_zero = zero_rule.mark_text(align='left', dx=5, dy=-5, text='損益分岐点').encode()
                lbl_whole = wholesale_rule.mark_text(align='left', dx=5, dy=-5, text='卸売水準').encode()

                final_chart = (base_chart + zero_rule + wholesale_rule + lbl_zero + lbl_whole).interactive()
                
                st.altair_chart(final_chart, use_container_width=True)


if __name__ == "__main__":
    main()
