'use client';

import React from 'react';
import { BlendRecipe, BlendIngredient, Bean } from '../../types';
import { calculateBeanMetrics } from '../../utils/calculations';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStorage } from '../../contexts/StorageContext';

// Components
// Header is in Layout
import { GlobalSettingsForm } from '../../components/dashboard/GlobalSettingsForm';
import { FeeSimulator } from '../../components/dashboard/FeeSimulator';
import { BlendRecipeForm } from '../../components/dashboard/BlendRecipeForm';
import { ProfitTable } from '../../components/dashboard/ProfitTable';
import { DiscountSimulator } from '../../components/dashboard/DiscountSimulator';

export default function BlendPage() {
    const { t } = useLanguage();
    const {
        blendRecipe: recipe, setBlendRecipe: setRecipe,
        globalSettings, setGlobalSettings,
        feeSettings, setFeeSettings
    } = useStorage();

    // --- Handlers ---
    const updateRecipe = (updates: Partial<BlendRecipe>) => {
        setRecipe(prev => ({ ...prev, ...updates }));
    };

    const updateIngredient = (id: string, updates: Partial<BlendIngredient>) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.map(i => i.id === id ? { ...i, ...updates } : i)
        }));
    };

    const addIngredient = () => {
        setRecipe(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                { id: `i-${Date.now()}`, name: 'New Bean', pricePerKg: 0, ratio: 0 }
            ]
        }));
    };

    const removeIngredient = (id: string) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter(i => i.id !== id)
        }));
    };

    // --- Conversion to Virtual Bean for Calculation ---
    // Avg Cost per Kg = Sum(Price * Ratio/100)
    const avgCostPerKg = recipe.ingredients.reduce((sum, i) => sum + (i.pricePerKg * (i.ratio / 100)), 0);

    // Total Purchase Amount = Avg Cost * Batch Size
    const totalCost = avgCostPerKg * recipe.totalBatchWeightKg;

    const virtualBean: Bean = {
        id: recipe.id,
        name: recipe.name,
        purchasePrice: Math.round(totalCost), // Total investment for this batch
        purchaseWeightKg: recipe.totalBatchWeightKg, // Total weight
        targetRateRetail: recipe.targetRateRetail,
        targetRateWholesale: recipe.targetRateWholesale
    };

    // We only run calc if valid batch size
    const metrics = recipe.totalBatchWeightKg > 0 ? calculateBeanMetrics(virtualBean, globalSettings, feeSettings) : null;
    const results = metrics ? [{ ...metrics, beanName: recipe.name }] : [];


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
                        {/* Blend Recipe Form */}
                        <section>
                            <BlendRecipeForm
                                recipe={recipe}
                                onUpdateRecipe={updateRecipe}
                                onUpdateIngredient={updateIngredient}
                                onAddIngredient={addIngredient}
                                onRemoveIngredient={removeIngredient}
                            />
                        </section>

                        {/* Results Table */}
                        <section>
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">📊 {t.profitAnalysis.title}</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-bold">{t.profitAnalysis.totalInvestment}</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-1">
                                        ¥ {Math.round(totalCost).toLocaleString()}
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
                                            const profit = results.reduce((sum, r) => sum + (r.profitPerBag * r.sellableUnits), 0);
                                            return totalCost > 0 ? (profit / totalCost * 100).toFixed(1) : '0.0';
                                        })()}%
                                    </div>
                                </div>
                            </div>

                            <ProfitTable results={results} unitG={globalSettings.salesUnitG} />
                        </section>

                        {/* Advanced Function: Discount Simulator */}
                        {results.length > 0 && (
                            <DiscountSimulator
                                beans={[virtualBean]}
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
