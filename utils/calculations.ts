import { Bean, GlobalSettings, FeeSettings, PlatformType, PaymentMethod } from '../types';

/**
 * Calculates the platform fee based on the provider AND now payment method.
 */
export const calculatePlatformFee = (price: number, settings: FeeSettings): number => {
    if (settings.saleType === 'IN_STORE') {
        // In-Store Calculation
        switch (settings.paymentMethod) {
            case 'CASH':
                return 0;
            case 'PAYPAY':
                return Math.floor(price * 0.0198); // 1.98%
            case 'CREDIT_CARD':
            case 'QUICPAY':
            case 'TRANSPORT_IC':
                return Math.floor(price * 0.0324); // 3.24% (Square/AirPay typical)
            case 'CUSTOM':
            default:
                return Math.floor(price * (settings.customFeeRate / 100));
        }
    } else {
        // Online Calculation
        switch (settings.platformType) {
            case 'BASE_STANDARD':
                return Math.floor(price * 0.066 + 40);
            case 'BASE_GROWTH':
                return Math.floor(price * 0.029);
            case 'STORES_FREE':
                return Math.floor(price * 0.05);
            case 'STORES_STANDARD':
                return Math.floor(price * 0.036);
            case 'SHOPIFY_BASIC':
                return Math.floor(price * 0.034);
            case 'SHOPIFY_STANDARD':
                return Math.floor(price * 0.033);
            case 'SHOPIFY_ADVANCED':
                return Math.floor(price * 0.032);
            case 'CUSTOM':
            default:
                return Math.floor(price * (settings.customFeeRate / 100));
        }
    }
};

/**
 * Calculates the effective roasted weight after all losses.
 */
export const calculateRoastedWeight = (
    rawWeightKg: number,
    roastLossRate: number,
    handpickLossRate: number
): number => {
    const rawWeightG = rawWeightKg * 1000;
    // Step 1: Roast Loss
    const afterRoast = rawWeightG * (1 - roastLossRate / 100);
    // Step 2: Handpick Loss
    const finalWeight = afterRoast * (1 - handpickLossRate / 100);
    return finalWeight;
};

/**
 * Main Simulator Logic
 */
export const calculateBeanMetrics = (
    bean: Bean,
    globalSettings: GlobalSettings,
    feeSettings: FeeSettings
) => {
    // 1. Roasted Weight Check
    const roastedWeightG = calculateRoastedWeight(
        bean.purchaseWeightKg,
        globalSettings.roastLossRate,
        globalSettings.handpickLossRate
    );

    // 2. Sellable Units
    const sellableUnits = Math.floor(roastedWeightG / globalSettings.salesUnitG);

    if (sellableUnits <= 0) {
        return null;
    }

    // --- TAX LOGIC ---
    const taxRateDecimal = globalSettings.taxRate / 100;

    // Input: Purchase Price (Tax Included)
    const purchasePriceIncTax = bean.purchasePrice;
    // If Taxable Object: Deduct Tax to find Base Cost
    // If Tax Exempt: Base Cost is the Full Amount (Tax included)
    const purchasePriceBase = globalSettings.isTaxableEntity
        ? Math.round(purchasePriceIncTax / (1 + taxRateDecimal))
        : purchasePriceIncTax;

    // Utility Cost (Usually Tax Included, treating same logic)
    const utilityCostIncTax = globalSettings.utilityCostPerRoast;
    const utilityCostBase = globalSettings.isTaxableEntity
        ? Math.round(utilityCostIncTax / (1 + taxRateDecimal)) // Assuming 10% or 8%, using same rate for simplicity
        : utilityCostIncTax;

    // Packaging Cost (Per Bag)
    const packagingCostIncTax = globalSettings.packagingCost || 0;
    const packagingCostBase = globalSettings.isTaxableEntity
        ? Math.round(packagingCostIncTax / (1 + taxRateDecimal))
        : packagingCostIncTax;


    // 3. Cost Per Bag
    // Batch Cost
    const batchCostBase = purchasePriceBase + utilityCostBase;
    const baseCostPerBag = batchCostBase / sellableUnits;

    const costPerBag = Math.ceil(baseCostPerBag + packagingCostBase);


    // 4. Recommended Retail Price
    // Retail Price is usually thought of as "Tax Included" for consumers.
    // We calculate target price based on Cost Rate.
    // Cost Rate = Cost / Sales Price.
    // If Taxable: Net Cost / Net Sales ? Or Gross Cost / Gross Sales?
    // Convention: Gross / Gross usually works for rough estimation, BUT
    // If we start from "Profit" goal, we should use Net.
    // Let's stick to consistent logic:
    // IF Taxable: costPerBag is Net. We want Net Price = NetCost / Rate.
    // Then Gross Price = Net Price * (1+Tax).
    // IF Exempt: costPerBag is Gross. We want Gross Price = GrossCost / Rate.

    const targetPriceBase = costPerBag / (bean.targetRateRetail / 100);

    const retailPriceIncTaxRaw = globalSettings.isTaxableEntity
        ? targetPriceBase * (1 + taxRateDecimal)
        : targetPriceBase;

    const retailPrice = Math.ceil(retailPriceIncTaxRaw / 10) * 10;


    const targetWholesalePriceBase = costPerBag / (bean.targetRateWholesale / 100);
    const wholesalePriceIncTaxRaw = globalSettings.isTaxableEntity
        ? targetWholesalePriceBase * (1 + taxRateDecimal)
        : targetWholesalePriceBase;

    const wholesalePrice = Math.ceil(wholesalePriceIncTaxRaw / 10) * 10;


    // 6. Profit & Fee Calculation (for Retail)
    // Fee is calculated on Gross Sell Price (System Fee)
    const feePerBagIncTax = calculatePlatformFee(retailPrice, feeSettings);

    // Shipping (Tax included presumably)
    const shippingIncTax = feeSettings.saleType === 'ONLINE' ? feeSettings.shippingCost : 0;

    // Profit Calculation
    // If Taxable:
    // Revenue (Net) = (RetailPrice / 1.08)
    // Fee (Net) = (Fee / 1.10) -- Wait, fees are 10%. 
    // We should just subtract Tax Liability.
    // Simplified: 
    // Profit = (RetailPrice - Fee - Shipping) - Cost - (TaxLiability)
    // TaxLiability = (OutputTax - InputTax)
    // OutputTax = Retail * 8/108
    // InputTax = Cost * 8/108

    // BUT we already have "costPerBag" as NET if taxable.
    // So Profit = (Retail / 1.08) - (Fee / 1.10) - (Shipping / 1.10) - Cost(Net).

    // This mixing of tax rates (8% vs 10%) is tricky. 
    // Let's assume uniform tax for simplicity OR stick to the simplest "Taxable" definition:
    // "Profit" = What enters the bank account after tax payment.

    let profitPerBag = 0;

    if (globalSettings.isTaxableEntity) {
        // Net Revenue
        const revenueNet = Math.round(retailPrice / (1 + taxRateDecimal));
        // Net Fee (Assuming same tax rate for simplicity, usually 10% though..)
        const feeNet = Math.round(feePerBagIncTax / (1 + taxRateDecimal));
        // Net Shipping
        const shippingNet = Math.round(shippingIncTax / (1 + taxRateDecimal));

        profitPerBag = revenueNet - feeNet - shippingNet - costPerBag;
    } else {
        // Gross Profit
        profitPerBag = retailPrice - feePerBagIncTax - shippingIncTax - costPerBag;
    }


    // 7. Breakeven
    // Contribution Per Bag = Price - Variable Costs
    // Variable Costs = Fees + Shipping + Packaging + Beans (if we treat beans as variable per unit sold? No, beans are batch investment).
    // Investment to recover = Batch Purchase + Utility.

    // Breakeven Units = Total Investment / Contribution per Bag

    let contributionPerBag = 0;
    let investmentTotal = 0;

    if (globalSettings.isTaxableEntity) {
        const revenueNet = Math.round(retailPrice / (1 + taxRateDecimal));
        const feeNet = Math.round(feePerBagIncTax / (1 + taxRateDecimal));
        const shippingNet = Math.round(shippingIncTax / (1 + taxRateDecimal));
        const packagingNet = Math.round(packagingCostBase); // Already net derived

        contributionPerBag = revenueNet - feeNet - shippingNet - packagingNet;
        investmentTotal = purchasePriceBase + utilityCostBase;
    } else {
        contributionPerBag = retailPrice - feePerBagIncTax - shippingIncTax - packagingCostIncTax;
        investmentTotal = purchasePriceIncTax + utilityCostIncTax;
    }

    let breakevenUnits = 999999;
    if (contributionPerBag > 0) {
        breakevenUnits = Math.ceil(investmentTotal / contributionPerBag);
    }

    // 8. Safety Check
    const isSafeMargin = profitPerBag > 0;

    return {
        beanId: bean.id,
        roastedWeightG,
        sellableUnits,
        costPerBag, // This is Net if Taxable, Gross if Exempt
        retailPrice, // Always Gross (Shelf Price)
        wholesalePrice, // Always Gross
        profitPerBag, // Net or Gross depending on mode
        feePerBag: feePerBagIncTax,
        breakevenUnits,
        isSafeMargin
    };
};
