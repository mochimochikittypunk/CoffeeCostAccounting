'use client';

import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { useStorage } from '../../contexts/StorageContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    calculateDaysInStock,
    calculateValuationGain,
    calculatePotentialBags,
    isSlowMovingStock,
    getStockLevelStatus
} from '../../utils/inventoryCalculations';

interface InventoryCardProps {
    item: InventoryItem;
    allItems: InventoryItem[];
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, allItems }) => {
    const { consumeInventory, removeInventoryItem, globalSettings } = useStorage();
    const { t, locale } = useLanguage();
    const [consumeAmount, setConsumeAmount] = useState<string>('');
    const [showConsume, setShowConsume] = useState(false);

    const daysInStock = calculateDaysInStock(item.registeredAt);
    const valuationGain = calculateValuationGain(item);
    const potentialBags = calculatePotentialBags(item, globalSettings.salesUnitG || 200); // Use global setting
    const isSlowMoving = isSlowMovingStock(item, allItems);
    const stockStatus = getStockLevelStatus(item.stockWeightKg);

    const stockColors = {
        critical: 'bg-red-500',
        low: 'bg-amber-500',
        normal: 'bg-emerald-500',
        high: 'bg-blue-500'
    };

    const handleConsume = () => {
        const amount = parseFloat(consumeAmount);
        if (!isNaN(amount) && amount > 0) {
            consumeInventory(item.id, amount);
            setConsumeAmount('');
            setShowConsume(false);
        }
    };

    const maxStock = 20; // For progress bar visualization
    const stockPercentage = Math.min((item.stockWeightKg / maxStock) * 100, 100);

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                            {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {t.inventory.registered}: {new Date(item.registeredAt).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}
                        </p>
                    </div>
                    {isSlowMoving && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                            ⚠️ {t.inventory.slowMovingAlert}
                        </span>
                    )}
                </div>
            </div>

            {/* Stock Bar */}
            <div className="px-4 py-3 bg-slate-50">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">{t.inventory.stockLevel}</span>
                    <span className="font-bold text-slate-900">{item.stockWeightKg.toFixed(1)} kg</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${stockColors[stockStatus]} transition-all duration-300`}
                        style={{ width: `${stockPercentage}%` }}
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>📦 {potentialBags}{t.inventory.potentialBags}</span>
                    <span>{daysInStock}{t.inventory.daysInStock}</span>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
                <div className="p-3 text-center">
                    <div className="text-xs text-slate-500">{t.inventory.retailPrice}</div>
                    <div className="text-sm font-semibold text-slate-900">¥{item.retailPrice.toLocaleString()}/100g</div>
                </div>
                <div className="p-3 text-center">
                    <div className="text-xs text-slate-500">{t.inventory.costPrice}</div>
                    <div className="text-sm font-semibold text-slate-900">¥{item.costPricePerKg.toLocaleString()}/kg</div>
                </div>
            </div>

            {/* Valuation */}
            <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-700">{t.inventory.valuationGain}</span>
                    <span className="text-sm font-bold text-emerald-700">
                        ¥{valuationGain.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-slate-100">
                {showConsume ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max={item.stockWeightKg}
                            value={consumeAmount}
                            onChange={(e) => setConsumeAmount(e.target.value)}
                            placeholder={locale === 'ja' ? '消費量 (kg)' : 'Amount (kg)'}
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                        />
                        <button
                            onClick={handleConsume}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            OK
                        </button>
                        <button
                            onClick={() => setShowConsume(false)}
                            className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowConsume(true)}
                            className="flex-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            {t.inventory.consumeAction}
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(locale === 'ja' ? 'この在庫を削除しますか？' : 'Delete this inventory item?')) {
                                    removeInventoryItem(item.id);
                                }
                            }}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            {t.inventory.delete}
                        </button>
                    </div>
                )}
            </div>

            {/* Slow Moving Alert */}
            {isSlowMoving && (
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
                    <p className="text-xs text-amber-800">
                        {t.inventory.slowMovingTip}
                    </p>
                </div>
            )}
        </div>
    );
};
