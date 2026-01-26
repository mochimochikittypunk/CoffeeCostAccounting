export type PlatformType =
    | 'BASE_STANDARD'
    | 'BASE_GROWTH'
    | 'STORES_FREE'
    | 'STORES_STANDARD'
    | 'SHOPIFY_BASIC'
    | 'SHOPIFY_STANDARD'
    | 'SHOPIFY_ADVANCED'
    | 'CUSTOM';

export type SaleType = 'ONLINE' | 'IN_STORE';

export type PaymentMethod =
    | 'CASH'
    | 'CREDIT_CARD'
    | 'PAYPAY'
    | 'QUICPAY'
    | 'TRANSPORT_IC'
    | 'CUSTOM';

export interface FeeSettings {
    saleType: SaleType;

    // Online Settings
    platformType: PlatformType;
    shippingCost: number; // JPY

    // In-Store Settings
    paymentMethod: PaymentMethod;

    // Common
    customFeeRate: number; // Percentage
}

export type PriceInputMode = 'active_total' | 'active_per_kg';

export interface Bean {
    id: string;
    name: string;
    purchasePrice: number; // JPY (Tax included) - ALWAYS Total Price
    purchaseWeightKg: number; // kg

    priceInputMode?: PriceInputMode;
    enteredUnitPrice?: number;

    // Target Margins
    targetRateRetail: number; // %
    targetRateWholesale: number; // %
}

// Blend Specific Types
export interface BlendIngredient {
    id: string; // Unique ID
    name: string;
    pricePerKg: number;
    ratio: number; // Percentage (0-100)
}

export interface BlendRecipe {
    id: string;
    name: string;
    ingredients: BlendIngredient[];
    totalBatchWeightKg: number; // How much of this blend to simulate (e.g. 5kg)
    targetRateRetail: number;
    targetRateWholesale: number;
}

export interface GlobalSettings {
    salesUnitG: number;
    taxRate: number; // Default 8 for reduced tax
    roastLossRate: number;

    handpickLossRate: number;
    utilityCostPerRoast: number;
    packagingCost: number; // JPY per bag

    // Tax Settings
    isTaxableEntity: boolean; // true = Taxable, false = Tax Exempt
}

export interface SimulationResult {
    beanId: string;
    roastedWeightG: number;
    sellableUnits: number;

    costPerBag: number;

    retailPrice: number;
    wholesalePrice: number;

    profitPerBag: number;
    feePerBag: number;
    breakevenUnits: number;

    isSafeMargin: boolean;
}
