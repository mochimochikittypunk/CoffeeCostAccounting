export type Locale = 'ja' | 'en';

export interface Dictionary {
    common: {
        title: string;
        subtitle: string;
        supportDev: string;
        nav: {
            single: string;
            blend: string;
            set: string;
            inventory: string;
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
        handpickOptions: {
            standard: string;
            specialty: string;
            premium: string;
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
    setProduct: {
        title: string;
        setName: string;
        sellingPrice: string;
        totalListPrice: string;
        totalCost: string;
        discountRate: string;
        profitMargin: string;
        addItem: string;
        itemName: string;
        weight: string;
        listPrice: string;
        listPricePerKg: string;
        costPricePerKg: string;
        cost: string;
        costBreakdown: string;
        overheads: {
            title: string;
            packaging: string;
            utility: string;
            shipping: string;
            taxRate: string;
        };
        fees: {
            title: string;
            marketing: string;
            platform: string;
            platformFeeRate: string;
            platformFeeFixed: string;
        };
        loss: {
            title: string;
            roastLoss: string;
            handpickLoss: string;
        }
        finalProfit: string;
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
    inventory: {
        title: string;
        subtitle: string;
        emptyTitle: string;
        emptyMessage: string;
        addItem: string;
        addFirst: string;
        cancel: string;
        consume: string;
        consumeAction: string;
        delete: string;
        daysInStock: string;
        valuationGain: string;
        slowMovingAlert: string;
        slowMovingTip: string;
        stockLevel: string;
        potentialBags: string;
        registered: string;
        retailPrice: string;
        costPrice: string;
        // Stats
        totalStock: string;
        totalValuation: string;
        totalGain: string;
        avgTurnoverDays: string;
        dayUnit: string;
        // Form
        formTitle: string;
        beanName: string;
        beanNamePlaceholder: string;
        stockWeight: string;
        costPriceLabel: string;
        retailPriceLabel: string;
        wholesalePriceLabel: string;
        submitButton: string;
        // Select from inventory
        selectFromInventory: string;
        selectHint: string;
        // History
        historyTitle: string;
        historyEmpty: string;
        undoAction: string;
        opAdd: string;
        opConsume: string;
        opDelete: string;
        opUpdate: string;
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
                blend: 'ブレンド計算',
                set: 'セット商品',
                inventory: '在庫管理'
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
            handpickOptions: {
                standard: 'プレミアム・コモディティ (10%)',
                specialty: 'スペシャルティ (5%)',
                premium: 'トップ・オブ・トップ (1%)',
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
        setProduct: {
            title: 'セット商品・福袋計算',
            setName: 'セット商品名',
            sellingPrice: 'セット販売価格 (税込)',
            totalListPrice: '定価合計',
            totalCost: '原価合計',
            discountRate: '割引率',
            profitMargin: '利益率',
            addItem: '＋ アイテムを追加',
            itemName: '商品名',
            weight: '内容量 (g)',
            listPrice: '定価',
            listPricePerKg: '定価単価 (円/100g)',
            costPricePerKg: '原価単価 (円/100g)',
            cost: '原価',
            costBreakdown: '原価の内訳',
            overheads: {
                title: '諸経費設定',
                packaging: 'パッケージ費用 (円/セット)',
                utility: '光熱費・その他 (円/セット)',
                shipping: '店舗負担送料 (円)',
                taxRate: '消費税率 (%)'
            },
            fees: {
                title: '販売手数料・チャネル',
                marketing: '販管費率',
                platform: 'プラットフォーム',
                platformFeeRate: '手数料率 (%)',
                platformFeeFixed: '固定手数料 (円)'
            },
            loss: {
                title: 'ロス・歩留まり設定',
                roastLoss: '焙煎ロス率 (%)',
                handpickLoss: 'ハンドピックロス (%)'
            },
            finalProfit: '最終利益'
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
        inventory: {
            title: '在庫管理',
            subtitle: 'コーヒー豆の在庫状況を管理し、ビジネスインサイトを確認',
            emptyTitle: '在庫がありません',
            emptyMessage: '「新規追加」ボタンから在庫を登録してください',
            addItem: '＋ 新規追加',
            addFirst: '＋ 最初の在庫を追加',
            cancel: '✕ キャンセル',
            consume: '焙煎消費',
            consumeAction: '🔥 焙煎消費',
            delete: '🗑',
            daysInStock: '日経過',
            valuationGain: '在庫評価益',
            slowMovingAlert: '長期在庫',
            slowMovingTip: '💡 平均より長期間滞留しています。ブレンドへの使用またはセール実施を推奨します。',
            stockLevel: '在庫量',
            potentialBags: '袋 (200g換算)',
            registered: '登録',
            retailPrice: '販売価格(小売)',
            costPrice: '原価',
            // Stats
            totalStock: '総在庫量',
            totalValuation: '総在庫評価額',
            totalGain: '総評価益',
            avgTurnoverDays: '平均在庫日数',
            dayUnit: '日',
            // Form
            formTitle: '📦 新規在庫登録',
            beanName: '豆の名称',
            beanNamePlaceholder: '例: エチオピア イルガチェフェ G1',
            stockWeight: '在庫量 (kg)',
            costPriceLabel: '仕入れ原価 (円/kg)',
            retailPriceLabel: '販売価格・小売 (円/100g)',
            wholesalePriceLabel: '販売価格・卸売 (円/kg)',
            submitButton: '登録する',
            // Select from inventory
            selectFromInventory: '📦 在庫から選択',
            selectHint: '📦 在庫から選択（名前・原価・重量を自動入力）',
            // History
            historyTitle: '📜 最近の操作履歴',
            historyEmpty: '履歴はありません',
            undoAction: '取り消し',
            opAdd: '追加',
            opConsume: '消費',
            opDelete: '削除',
            opUpdate: '更新',
        },
    },
    en: {
        common: {
            title: 'Coffee Profit Simulator',
            subtitle: 'Next.js Edition',
            supportDev: 'Support Dev',
            nav: {
                single: 'Single Origin',
                blend: 'Blend Calculator',
                set: 'Set Product',
                inventory: 'Inventory'
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
            handpickOptions: {
                standard: 'Premium/Commodity (10%)',
                specialty: 'Specialty (5%)',
                premium: 'Top of Top (1%)',
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
        setProduct: {
            title: 'Set Product Calculator',
            setName: 'Set Name',
            sellingPrice: 'Selling Price (Tax Inc.)',
            totalListPrice: 'Total List Price',
            totalCost: 'Total Cost',
            discountRate: 'Discount Rate',
            profitMargin: 'Profit Margin',
            addItem: '+ Add Item',
            itemName: 'Item Name',
            weight: 'Weight (g)',
            listPrice: 'List Price',
            listPricePerKg: 'List Price (JPY/100g)',
            costPricePerKg: 'Cost Price (JPY/100g)',
            cost: 'Cost',
            costBreakdown: 'Cost Breakdown',
            overheads: {
                title: 'Overheads',
                packaging: 'Packaging Cost (JPY/set)',
                utility: 'Utility/Other (JPY/set)',
                shipping: 'Shipping Cost (Store Paid)',
                taxRate: 'Tax Rate (%)'
            },
            fees: {
                title: 'Sales Channel & Fees',
                marketing: 'Marketing Cost Rate',
                platform: 'Platform',
                platformFeeRate: 'Fee Rate (%)',
                platformFeeFixed: 'Fixed Fee (JPY)'
            },
            loss: {
                title: 'Loss Settings',
                roastLoss: 'Roast Loss (%)',
                handpickLoss: 'Handpick Loss (%)'
            },
            finalProfit: 'Final Profit'
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
        inventory: {
            title: 'Inventory Management',
            subtitle: 'Track your coffee bean stock and get business insights',
            emptyTitle: 'No Inventory',
            emptyMessage: 'Add your first item using the "Add New" button',
            addItem: '+ Add New',
            addFirst: '+ Add First Item',
            cancel: '✕ Cancel',
            consume: 'Consume',
            consumeAction: '🔥 Roast Consume',
            delete: '🗑',
            daysInStock: 'days',
            valuationGain: 'Valuation Gain',
            slowMovingAlert: 'Slow Moving',
            slowMovingTip: '💡 This item has been in stock longer than average. Consider using in a blend or running a sale.',
            stockLevel: 'Stock',
            potentialBags: 'bags (200g)',
            registered: 'Registered',
            retailPrice: 'Retail Price',
            costPrice: 'Cost',
            // Stats
            totalStock: 'Total Stock',
            totalValuation: 'Total Valuation',
            totalGain: 'Total Gain',
            avgTurnoverDays: 'Avg. Days in Stock',
            dayUnit: ' days',
            // Form
            formTitle: '📦 Add New Inventory',
            beanName: 'Bean Name',
            beanNamePlaceholder: 'e.g. Ethiopia Yirgacheffe G1',
            stockWeight: 'Stock Weight (kg)',
            costPriceLabel: 'Cost Price (JPY/kg)',
            retailPriceLabel: 'Retail Price (JPY/100g)',
            wholesalePriceLabel: 'Wholesale Price (JPY/kg)',
            submitButton: 'Register',
            // Select from inventory
            selectFromInventory: '📦 Select from Inventory',
            selectHint: '📦 Select from Inventory (auto-fill name, cost, weight)',
            // History
            historyTitle: '📜 Recent History',
            historyEmpty: 'No history',
            undoAction: 'Undo',
            opAdd: 'Add',
            opConsume: 'Consume',
            opDelete: 'Delete',
            opUpdate: 'Update',
        },
    }
};
