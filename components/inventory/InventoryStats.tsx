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
    const { inventory, monthlyRoastingData } = useStorage();
    const [selectedMonth, setSelectedMonth] = React.useState<string>('');

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

    // Handle initial selection once data loads
    React.useEffect(() => {
        if (monthlyRoastingData.length > 0 && !selectedMonth) {
            setSelectedMonth(monthlyRoastingData[0].month);
        }
    }, [monthlyRoastingData, selectedMonth]);

    const activeMonthData = monthlyRoastingData.find(d => d.month === selectedMonth) 
        || monthlyRoastingData[0] 
        || null;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Standard Stats */}
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

            {/* Monthly Roasting Stats Card */}
            <div className="col-span-2 lg:col-span-1 bg-red-50 text-red-700 rounded-lg p-4 border border-white/50 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1 justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🔥</span>
                        <span className="text-xs font-medium opacity-80">{t.inventory.monthlyRoasting || '月間焙煎量'}</span>
                    </div>
                </div>
                
                <div className="mt-1">
                    {monthlyRoastingData.length > 0 ? (
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold">{activeMonthData?.totalKg.toFixed(1) || '0.0'}</span>
                            <span className="text-sm">{t.inventory.monthlyRoastingUnit || 'kg'}</span>
                        </div>
                    ) : (
                        <div className="text-sm font-medium mt-1">{t.inventory.noRoastingData || '焙煎データなし'}</div>
                    )}
                </div>

                {monthlyRoastingData.length > 0 && (
                    <div className="mt-3">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-white border-0 text-xs px-2 py-1.5 focus:ring-0 focus:outline-none rounded w-full text-slate-700 font-medium shadow-sm transition-colors hover:bg-slate-50 cursor-pointer"
                        >
                            <option value="" disabled hidden>{t.inventory.monthlyRoastingDropdown || '直近12ヶ月'}</option>
                            {monthlyRoastingData.map(data => (
                                <option key={data.month} value={data.month}>
                                    {data.month.replace('-', '/')}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};
