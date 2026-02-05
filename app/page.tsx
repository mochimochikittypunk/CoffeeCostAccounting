'use client';

import React, { useState } from 'react';
import { Bean, SimulationResult } from '../types';
import { calculateBeanMetrics } from '../utils/calculations';
import { useLanguage } from '../contexts/LanguageContext';
import { useStorage } from '../contexts/StorageContext';

// Components
// Header is in Layout
import { GlobalSettingsForm } from '../components/dashboard/GlobalSettingsForm';
import { FeeSimulator } from '../components/dashboard/FeeSimulator';
import { BeanConfigForm } from '../components/dashboard/BeanConfigForm';
import { ProfitTable } from '../components/dashboard/ProfitTable';
import { DiscountSimulator } from '../components/dashboard/DiscountSimulator';

export default function HomePage() {
    const { t } = useLanguage();
    const {
        beans, setBeans,
        activeBeanId, setActiveBeanId,
        globalSettings, setGlobalSettings,
        feeSettings, setFeeSettings,
        addInventoryItem
    } = useStorage();

    const [addedToInventory, setAddedToInventory] = useState<string[]>([]);

    // --- Handlers ---
    const updateBean = (id: string, updates: Partial<Bean>) => {
        setBeans(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleAddToInventory = (bean: Bean, result: SimulationResult) => {
        const costPerKg = bean.purchaseWeightKg > 0
            ? bean.purchasePrice / bean.purchaseWeightKg
            : 0;

        addInventoryItem({
            name: bean.name || 'Unnamed Bean',
            stockWeightKg: bean.purchaseWeightKg,
            retailPrice: result.retailPrice,
            wholesalePrice: result.wholesalePrice * 10, // Convert 100g → kg
            costPricePerKg: costPerKg,
        });

        setAddedToInventory(prev => [...prev, bean.id]);

        // Reset after 3 seconds
        setTimeout(() => {
            setAddedToInventory(prev => prev.filter(id => id !== bean.id));
        }, 3000);
    };

    // --- Calculations ---
    const results: (SimulationResult & { beanName: string; beanId: string })[] = beans
        .filter(b => b.purchasePrice > 0 && b.purchaseWeightKg > 0)
        .flatMap(bean => {
            const metrics = calculateBeanMetrics(bean, globalSettings, feeSettings);
            if (!metrics) return [];
            return [{ ...metrics, beanName: bean.name || 'Unnamed Bean', beanId: bean.id }];
        });


    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header and Nav are in Layout */}


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar (Settings) */}
                    <div className="lg:col-span-3 space-y-6">
                        <GlobalSettingsForm
                            settings={globalSettings}
                            onChange={setGlobalSettings}
                        />
                        <FeeSimulator
                            settings={feeSettings}
                            onChange={setFeeSettings}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9 space-y-8">
                        {/* Bean Input Form */}
                        <section>
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">📝 {t.beanConfig.title}</h2>
                            <BeanConfigForm
                                beans={beans}
                                activeBeanId={activeBeanId}
                                onSelectBean={setActiveBeanId}
                                onUpdateBean={updateBean}
                            />
                        </section>

                        {/* Results Table */}
                        <section>
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">📊 {t.profitAnalysis.title}</h2>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-bold">{t.profitAnalysis.totalInvestment}</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-1">
                                        ¥ {beans.reduce((sum, b) => sum + (b.purchasePrice || 0), 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-bold">{t.profitAnalysis.expectedProfit}</div>
                                    <div className="text-2xl font-bold text-emerald-600 mt-1">
                                        ¥ {results.reduce((sum, r) => sum + (r.profitPerBag * r.sellableUnits), 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-bold">{t.profitAnalysis.roi}</div>
                                    <div className="text-2xl font-bold text-blue-600 mt-1">
                                        {(() => {
                                            const invest = beans.reduce((sum, b) => sum + (b.purchasePrice || 0), 0);
                                            const profit = results.reduce((sum, r) => sum + (r.profitPerBag * r.sellableUnits), 0);
                                            return invest > 0 ? (profit / invest * 100).toFixed(1) : '0.0';
                                        })()}%
                                    </div>
                                </div>
                            </div>

                            <ProfitTable results={results} unitG={globalSettings.salesUnitG} />

                            {/* Add to Inventory Button for each result */}
                            {results.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {results.map(result => {
                                        const bean = beans.find(b => b.id === result.beanId);
                                        if (!bean) return null;
                                        const isAdded = addedToInventory.includes(bean.id);
                                        return (
                                            <button
                                                key={result.beanId}
                                                onClick={() => handleAddToInventory(bean, result)}
                                                disabled={isAdded}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isAdded
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {isAdded ? '✓ 在庫に追加済み' : `📦 ${result.beanName} を在庫に追加`}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Advanced Function: Discount Simulator */}
                        {results.length > 0 && (
                            <DiscountSimulator
                                beans={beans.filter(b => b.purchasePrice > 0)} // Pass reference to full beans for context
                                globalSettings={globalSettings}
                                feeSettings={feeSettings}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

