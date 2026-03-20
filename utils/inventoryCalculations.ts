import { InventoryItem } from '../types';

/**
 * Calculate days since item was registered
 */
export function calculateDaysInStock(registeredAt: string): number {
    const registered = new Date(registeredAt);
    const now = new Date();
    const diffMs = now.getTime() - registered.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate valuation gain (評価益)
 * = (小売価格/100g換算 - 原価/100g換算) × 在庫量(g)
 */
export function calculateValuationGain(item: InventoryItem): number {
    const costPer100g = item.costPricePerKg / 10; // /kg → /100g
    const profitPer100g = item.retailPrice - costPer100g;
    const stockIn100g = item.stockWeightKg * 10;
    return Math.round(profitPer100g * stockIn100g);
}

/**
 * Calculate potential bags (袋販売可能数)
 * Assuming 200g bags by default (configurable via salesUnitG param)
 */
export function calculatePotentialBags(item: InventoryItem, salesUnitG: number = 200): number {
    const stockG = item.stockWeightKg * 1000;
    return Math.floor(stockG / salesUnitG);
}

/**
 * Calculate break-even point (損益分岐点)
 * = 原価総額 ÷ 1袋あたり利益
 */
export function calculateBreakEvenBags(item: InventoryItem, salesUnitG: number = 200): number {
    const totalCost = item.costPricePerKg * item.stockWeightKg;
    const profitPerBag = (item.retailPrice * (salesUnitG / 100)) - (item.costPricePerKg * (salesUnitG / 1000));
    if (profitPerBag <= 0) return Infinity;
    return Math.ceil(totalCost / profitPerBag);
}

/**
 * Determine if item is slow-moving (不良在庫)
 * Returns true if days in stock exceeds (avgDays + stdDev)
 */
export function isSlowMovingStock(
    item: InventoryItem,
    allItems: InventoryItem[],
    defaultAvgDays: number = 30
): boolean {
    if (allItems.length === 0) {
        return calculateDaysInStock(item.registeredAt) > defaultAvgDays;
    }

    const daysArray = allItems.map(i => calculateDaysInStock(i.registeredAt));
    const avg = daysArray.reduce((a, b) => a + b, 0) / daysArray.length;

    // Calculate standard deviation
    const squaredDiffs = daysArray.map(d => Math.pow(d - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / daysArray.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    const itemDays = calculateDaysInStock(item.registeredAt);
    return itemDays > (avg + stdDev);
}

/**
 * Get stock level status for UI coloring
 */
export function getStockLevelStatus(stockWeightKg: number): 'critical' | 'low' | 'normal' | 'high' {
    if (stockWeightKg <= 0.5) return 'critical';
    if (stockWeightKg <= 2) return 'low';
    if (stockWeightKg <= 10) return 'normal';
    return 'high';
}

/**
 * Calculate average turnover days for all inventory
 */
export function calculateAverageTurnoverDays(items: InventoryItem[]): number {
    if (items.length === 0) return 0;
    const totalDays = items.reduce((sum, item) => sum + calculateDaysInStock(item.registeredAt), 0);
    return Math.round(totalDays / items.length);
}

/**
 * Aggregate CONSUME history logs into monthly totals (kg)
 * Returns the last 12 months including the current month, even if 0.
 */
import { InventoryOperationLog } from '../types';

export function aggregateMonthlyRoasting(logs: InventoryOperationLog[]): { month: string; totalKg: number }[] {
    const monthsData = new Map<string, number>();
    
    // Initialize the last 12 months with 0
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthsData.set(monthStr, 0);
    }

    // Aggregate only CONSUME logs
    logs.filter(log => log.type === 'CONSUME').forEach(log => {
        const date = new Date(log.timestamp);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Only count if it's within our initialized 12 months map
        if (monthsData.has(monthStr)) {
            const currentTotal = monthsData.get(monthStr) || 0;
            // amountDelta is negative for CONSUME, so we take absolute or subtract
            const amount = Math.abs(log.amountDelta);
            monthsData.set(monthStr, currentTotal + amount);
        }
    });

    // Convert map to array and sort descending (newest month first)
    return Array.from(monthsData.entries())
        .map(([month, totalKg]) => ({ month, totalKg }))
        .sort((a, b) => b.month.localeCompare(a.month));
}
