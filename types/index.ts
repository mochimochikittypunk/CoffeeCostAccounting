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
    inventoryItemId?: string; // Link to source inventory (added for smart consumption)
}

export interface BlendRecipe {
    id: string;
    name: string;
    ingredients: BlendIngredient[];
    totalBatchWeightKg: number; // How much of this blend to simulate (e.g. 5kg)
    targetRateRetail: number;
    targetRateWholesale: number;
}

// Set Product Types
export interface SetProductItem {
    id: string;
    name: string;
    inventoryItemId?: string; // Link to source inventory
    quantity: number; // g
    retailPricePerKg: number; // List price per kg
    costPricePerKg: number; // Cost per kg
}

export interface SetProduct {
    id: string;
    name: string;
    items: SetProductItem[];
    sellingPrice: number; // Total selling price for the set
    plannedQuantity: number; // How many sets to sell/produce

    // Overhead Settings (Override Global)
    packagingCost: number; // JPY
    utilityCost: number; // JPY
    isTaxable: boolean;
    taxRate: number; // Percent override
    roastLossRate: number; // %
    handpickLossRate: number; // %

    // Fee Settings (Override FeeSettings)
    shippingCost: number; // Store burdened shipping cost
    platformFeeRate: number; // %
    platformFeeFixed: number; // JPY
    platformName: string; // e.g., 'BASE', 'Shopify'
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

// Inventory Management Types
// Inventory Management Types
export interface InventoryItem {
    id: string;
    name: string;
    stockWeightKg: number;      // 在庫量 (kg, 0.1単位)
    retailPrice: number;         // 販売価格(小売) / 100gあたり
    wholesalePrice: number;      // 販売価格(卸売) / kgあたり
    costPricePerKg: number;      // 仕入れ原価 / kgあたり
    registeredAt: string;        // ISO date string (localStorage用)
    description?: string;        // Optional description

    // For blends: link to ingredient inventory items
    composition?: {
        inventoryItemId: string; // ID of the source inventory item
        name: string;            // Snapshot of name for display
        ratio: number;           // Percentage (0-100)
    }[];
}

export interface InventoryOperationLog {
    id: string;
    timestamp: string;
    type: 'ADD' | 'CONSUME' | 'UPDATE' | 'DELETE';
    itemId: string;
    itemName: string;
    amountDelta: number; // Positive for Add, Negative for Consume
    relatedLogIds?: string[]; // IDs of related logs (for cascade undo)
}

export interface UserProfile {
    id: string;
    userId: string;
    credits: number;
    displayName?: string;
    shopName?: string;
    roasterMachine?: string;
    roasterSize?: string;
    lastActiveAt?: string;
}
