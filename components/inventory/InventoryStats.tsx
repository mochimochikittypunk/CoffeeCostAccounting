'use client';

import React from 'react';
import { useStorage } from '../../contexts/StorageContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    calculateValuationGain,
    calculateAverageTurnoverDays
} from '../../utils/inventoryCalculations';

export const InventoryStats: React.FC = () => {
    const { t } = useLanguage();
    const { inventory } = useStorage();

    // Calculate totals
    const totalStockKg = inventory.reduce((sum, item) => sum + item.stockWeightKg, 0);
    const totalValuation = inventory.reduce((sum, item) => sum + calculateValuationGain(item), 0);
    const avgTurnoverDays = calculateAverageTurnoverDays(inventory);
    const totalCostValue = inventory.reduce((sum, item) => sum + (item.costPricePerKg * item.stockWeightKg), 0);

    const stats = [
        {
            label: t.inventory.totalStock,
            value: `${totalStockKg.toFixed(1)} kg`,
            icon: '📦',
            color: 'bg-blue-50 text-blue-700'
        },
        {
            label: t.inventory.totalValuation,
            value: `¥${totalCostValue.toLocaleString()}`,
            icon: '💰',
            color: 'bg-slate-50 text-slate-700'
        },
        {
            label: t.inventory.totalGain,
            value: `¥${totalValuation.toLocaleString()}`,
            icon: '📈',
            color: 'bg-emerald-50 text-emerald-700'
        },
        {
            label: t.inventory.avgTurnoverDays,
            value: `${avgTurnoverDays}${t.inventory.dayUnit}`,
            icon: '📅',
            color: avgTurnoverDays > 30 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className={`${stat.color} rounded-lg p-4 border border-white/50`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{stat.icon}</span>
                        <span className="text-xs font-medium opacity-80">{stat.label}</span>
                    </div>
                    <div className="text-xl font-bold">{stat.value}</div>
                </div>
            ))}
        </div>
    );
};
