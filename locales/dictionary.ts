export type Locale = 'ja' | 'en';

export interface Dictionary {
    common: {
        title: string;
        subtitle: string;
        supportDev: string;
        nav: {
            single: string;
            blend: string;
        };
        unitYen: string;
        unitKg: string;
        unitG: string;
        unitBags: string;
        taxIncluded: string;
        taxExcluded: string;
    };
    globalSettings: {
        title: string;
        salesUnit: string;
        roastLoss: string;
        handpickLoss: string;
        utilityCost: string;
        packagingCost: string;
        taxSettings: string;
        isTaxable: string;
        taxRate: string;
        roastOptions: {
            light: string;
            medium: string;
            dark: string;
        };
        newBadge: string;
    };
    feeSimulator: {
        title: string;
        mode: {
            online: string;
            inStore: string;
        };
        shippingCost: string;
        rate: string;
        plans: {
            BASE_STANDARD: string;
            BASE_GROWTH: string;
            STORES_FREE: string;
            STORES_STANDARD: string;
            SHOPIFY_BASIC: string;
            SHOPIFY_STANDARD: string;
            SHOPIFY_ADVANCED: string;
            CUSTOM: string;
        };
        paymentMethods: {
            CASH: string;
            CREDIT_CARD: string;
            PAYPAY: string;
            QUICPAY: string;
            TRANSPORT_IC: string;
            CUSTOM: string;
        };
        descriptions: {
            // Platform
            BASE_STANDARD: string;
            BASE_GROWTH: string;
            STORES_FREE: string;
            STORES_STANDARD: string;
            SHOPIFY_BASIC: string;
            SHOPIFY_STANDARD: string;
            SHOPIFY_ADVANCED: string;
            // Payment
            CASH: string;
            CREDIT_CARD: string;
            PAYPAY: string;
            QUICPAY: string;
            TRANSPORT_IC: string;
            CUSTOM: string;
        };
    };
    beanConfig: {
        title: string;
        nameLabel: string;
        namePlaceholder: string;
        purchasePrice: string;
        purchaseWeight: string;
        targetRateRetail: string;
        targetRateWholesale: string;
        priceMode: {
            label: string;
            total: string;
            perKg: string;
        };
    };
    blendConfig: {
        title: string;
        addIngredient: string;
        ingredientName: string;
        ratio: string;
        batchSize: string;
        totalRatio: string;
        totalCost: string;
        averageCost: string;
        recipeName: string;
    };
    profitAnalysis: {
        title: string;
        totalInvestment: string;
        expectedProfit: string;
        roi: string;
        table: {
            name: string;
            retailPrice: string;
            wholesalePrice: string;
            profitPerBag: string;
            costPerBag: string;
            sellableUnits: string;
            breakeven: string;
        };
        badges: {
            safe: string;
            warning: string;
            danger: string;
        };
    };
    discountSimulator: {
        title: string;
        targetBean: string;
        bagSize: string;
        discountRate: string;
        sellingPrice: string;
        profit: string;
        costRate: string;
        chart: {
            xAxis: string;
            yAxis: string;
            wholesaleLine: string;
            breakevenLine: string;
        };
    };
}

export const dictionaries: Record<Locale, Dictionary> = {
    ja: {
        common: {
            title: 'コーヒー原価計算・価格シミュレータ',
            subtitle: 'Next.js Edition',
            supportDev: '開発を応援する',
            nav: {
                single: 'シングルオリジン',
                blend: 'ブレンド計算'
            },
            unitYen: '円',
            unitKg: 'kg',
            unitG: 'g',
            unitBags: '袋',
            taxIncluded: '税込',
            taxExcluded: '税抜',
        },
        globalSettings: {
            title: '全体設定',
            salesUnit: '基本販売単位 (g)',
            roastLoss: '焙煎ロス率 (%)',
            handpickLoss: 'ハンドピックロス率 (%)',
            utilityCost: '光熱費/バッチ (円)',
            packagingCost: 'パッケージ費用/袋 (円)',
            taxSettings: '消費税設定',
            isTaxable: '課税事業者ですか？',
            taxRate: '軽減税率 (%)',
            roastOptions: {
                light: '浅煎り (10%)',
                medium: '中煎り (15%)',
                dark: '深煎り (20%)',
            },
            newBadge: 'New',
        },
        feeSimulator: {
            title: '販売チャネル・手数料',
            mode: {
                online: 'オンライン販売',
                inStore: '店頭販売',
            },
            shippingCost: '店舗負担送料 (円)',
            rate: '料率 (%)',
            plans: {
                BASE_STANDARD: 'BASE (スタンダード)',
                BASE_GROWTH: 'BASE (グロース)',
                STORES_FREE: 'STORES (フリー)',
                STORES_STANDARD: 'STORES (スタンダード)',
                SHOPIFY_BASIC: 'Shopify (ベーシック)',
                SHOPIFY_STANDARD: 'Shopify (スタンダード)',
                SHOPIFY_ADVANCED: 'Shopify (プレミアム)',
                CUSTOM: 'カスタム'
            },
            paymentMethods: {
                CASH: '現金',
                CREDIT_CARD: 'クレジットカード',
                PAYPAY: 'PayPay',
                QUICPAY: 'QUICPay',
                TRANSPORT_IC: '交通系IC',
                CUSTOM: 'カスタム'
            },
            descriptions: {
                BASE_STANDARD: '6.6% + 40円',
                BASE_GROWTH: '2.9% (別途月額費)',
                STORES_FREE: '5%',
                STORES_STANDARD: '3.6%',
                SHOPIFY_BASIC: '3.4%',
                SHOPIFY_STANDARD: '3.3%',
                SHOPIFY_ADVANCED: '3.2%',

                CASH: '0%',
                CREDIT_CARD: '3.24%~',
                PAYPAY: '1.98%',
                QUICPAY: '3.24%~',
                TRANSPORT_IC: '3.24%~',
                CUSTOM: '任意設定'
            }
        },
        beanConfig: {
            title: '豆の設定',
            nameLabel: '豆の名称',
            namePlaceholder: '例: エチオピア イルガチェフェ',
            purchasePrice: '仕入れ価格 (税込)',
            purchaseWeight: '仕入れ重量 (kg)',
            targetRateRetail: '目標原価率 (小売)',
            targetRateWholesale: '目標原価率 (卸売)',
            priceMode: {
                label: '入力モード',
                total: '総額指定',
                perKg: '1kg単価指定'
            }
        },
        blendConfig: {
            title: 'ブレンド配合レシピ',
            addIngredient: '＋ 豆を追加',
            ingredientName: '豆の名称',
            ratio: '配合比率 (%)',
            batchSize: 'シミュレーション重量 (kg)',
            totalRatio: '合計比率',
            totalCost: '合計仕入れ額',
            averageCost: '平均kg単価',
            recipeName: 'ブレンド名'
        },
        profitAnalysis: {
            title: '収益分析',
            totalInvestment: '仕入れ総額',
            expectedProfit: '想定利益総額',
            roi: '投資対効果 (ROI)',
            table: {
                name: '豆の名称',
                retailPrice: '販売価格(小売)',
                wholesalePrice: '販売価格(卸売)',
                profitPerBag: '想定利益/袋',
                costPerBag: '原価/袋',
                sellableUnits: '販売可能数',
                breakeven: '損益分岐',
            },
            badges: {
                safe: '🟢 安全圏',
                warning: '🟡 注意',
                danger: '🔴 赤字',
            },
        },
        discountSimulator: {
            title: '割引・大袋シミュレーター',
            targetBean: '分析対象の豆',
            bagSize: '大袋サイズ (g)',
            discountRate: '割引率 (%)',
            sellingPrice: '販売価格 (税込)',
            profit: '想定利益',
            costRate: '原価率',
            chart: {
                xAxis: '割引率 (%)',
                yAxis: '利益 (円)',
                wholesaleLine: '卸売水準',
                breakevenLine: '損益分岐点',
            },
        },
    },
    en: {
        common: {
            title: 'Coffee Profit Simulator',
            subtitle: 'Next.js Edition',
            supportDev: 'Support Dev',
            nav: {
                single: 'Single Origin',
                blend: 'Blend Calculator'
            },
            unitYen: 'JPY',
            unitKg: 'kg',
            unitG: 'g',
            unitBags: 'bags',
            taxIncluded: 'Tax Inc.',
            taxExcluded: 'Tax Exc.',
        },
        globalSettings: {
            title: 'Global Settings',
            salesUnit: 'Sales Unit (g)',
            roastLoss: 'Roast Loss (%)',
            handpickLoss: 'Handpick Loss (%)',
            utilityCost: 'Utility Cost/Batch (JPY)',
            packagingCost: 'Packaging Cost/Bag (JPY)',
            taxSettings: 'Tax Settings',
            isTaxable: 'Are you a Taxable Entity?',
            taxRate: 'Reduced Tax Rate (%)',
            roastOptions: {
                light: 'Light Roast (10%)',
                medium: 'Medium Roast (15%)',
                dark: 'Dark Roast (20%)',
            },
            newBadge: 'New',
        },
        feeSimulator: {
            title: 'Sales Channel & Fees',
            mode: {
                online: 'Online Sales',
                inStore: 'In-Store Sales',
            },
            shippingCost: 'Shipping Cost (Store Paid)',
            rate: 'Rate (%)',
            plans: {
                BASE_STANDARD: 'BASE (Standard)',
                BASE_GROWTH: 'BASE (Growth)',
                STORES_FREE: 'STORES (Free)',
                STORES_STANDARD: 'STORES (Standard)',
                SHOPIFY_BASIC: 'Shopify (Basic)',
                SHOPIFY_STANDARD: 'Shopify (Standard)',
                SHOPIFY_ADVANCED: 'Shopify (Advanced)',
                CUSTOM: 'Custom'
            },
            paymentMethods: {
                CASH: 'Cash',
                CREDIT_CARD: 'Credit Card',
                PAYPAY: 'PayPay',
                QUICPAY: 'QUICPay',
                TRANSPORT_IC: 'Transport IC',
                CUSTOM: 'Custom'
            },
            descriptions: {
                BASE_STANDARD: '6.6% + 40 JPY',
                BASE_GROWTH: '2.9% (+ Monthly Fee)',
                STORES_FREE: '5%',
                STORES_STANDARD: '3.6%',
                SHOPIFY_BASIC: '3.4%',
                SHOPIFY_STANDARD: '3.3%',
                SHOPIFY_ADVANCED: '3.2%',

                CASH: '0%',
                CREDIT_CARD: '3.24%~',
                PAYPAY: '1.98%',
                QUICPAY: '3.24%~',
                TRANSPORT_IC: '3.24%~',
                CUSTOM: 'Manual'
            }
        },
        beanConfig: {
            title: 'Bean Configuration',
            nameLabel: 'Bean Name',
            namePlaceholder: 'e.g. Ethiopia Yirgacheffe',
            purchasePrice: 'Purchase Price (Tax Inc.)',
            purchaseWeight: 'Purchase Weight (kg)',
            targetRateRetail: 'Target Cost Rate (Retail)',
            targetRateWholesale: 'Target Cost Rate (Wholesale)',
            priceMode: {
                label: 'Input Mode',
                total: 'Total Price',
                perKg: 'Per Kg Price'
            }
        },
        blendConfig: {
            title: 'Blend Recipe',
            addIngredient: '+ Add Bean',
            ingredientName: 'Bean Name',
            ratio: 'Ratio (%)',
            batchSize: 'Simulated Weight (kg)',
            totalRatio: 'Total Ratio',
            totalCost: 'Total Cost',
            averageCost: 'Avg Cost/Kg',
            recipeName: 'Blend Name'
        },
        profitAnalysis: {
            title: 'Profit Analysis',
            totalInvestment: 'Total Investment',
            expectedProfit: 'Expected Profit',
            roi: 'ROI',
            table: {
                name: 'Bean Name',
                retailPrice: 'Retail Price',
                wholesalePrice: 'Wholesale Price',
                profitPerBag: 'Profit/Bag',
                costPerBag: 'Cost/Bag',
                sellableUnits: 'Sellable Units',
                breakeven: 'Breakeven',
            },
            badges: {
                safe: '🟢 Safe Margin',
                warning: '🟡 Low Margin',
                danger: '🔴 Loss',
            },
        },
        discountSimulator: {
            title: 'Volume Discount Simulator',
            targetBean: 'Target Bean',
            bagSize: 'Bag Size (g)',
            discountRate: 'Discount (%)',
            sellingPrice: 'Selling Price (Tax Inc.)',
            profit: 'Profit',
            costRate: 'Cost Rate',
            chart: {
                xAxis: 'Discount (%)',
                yAxis: 'Profit (JPY)',
                wholesaleLine: 'Wholesale Line',
                breakevenLine: 'Breakeven',
            },
        },
    }
};
