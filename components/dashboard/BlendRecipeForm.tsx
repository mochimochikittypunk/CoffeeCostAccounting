'use client';

import React from 'react';
import { BlendIngredient, BlendRecipe } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { NumberInput } from '../ui/NumberInput';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';

interface BlendRecipeFormProps {
    recipe: BlendRecipe;
    onUpdateRecipe: (updates: Partial<BlendRecipe>) => void;
    onUpdateIngredient: (id: string, updates: Partial<BlendIngredient>) => void;
    onAddIngredient: () => void;
    onRemoveIngredient: (id: string) => void;
}

export const BlendRecipeForm: React.FC<BlendRecipeFormProps> = ({
    recipe,
    onUpdateRecipe,
    onUpdateIngredient,
    onAddIngredient,
    onRemoveIngredient
}) => {
    const { t } = useLanguage();

    // Calculations
    const totalRatio = recipe.ingredients.reduce((sum, i) => sum + i.ratio, 0);
    // Avg Cost = Sum(Price * (Ratio/100))
    const avgCostPerKg = recipe.ingredients.reduce((sum, i) => sum + (i.pricePerKg * (i.ratio / 100)), 0);

    // Simulation Context
    const totalCost = avgCostPerKg * recipe.totalBatchWeightKg;

    const isInvalidRatio = Math.abs(totalRatio - 100) > 0.1; // Allow small float error

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">☕ {t.blendConfig.title}</h2>
                <div className="text-right">
                    <div className="text-sm text-slate-500">{t.blendConfig.averageCost}</div>
                    <div className="text-xl font-bold text-slate-900">¥ {Math.round(avgCostPerKg).toLocaleString()} <span className="text-sm font-normal text-slate-400">/kg</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.blendConfig.recipeName}</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-slate-300 rounded-md"
                        value={recipe.name}
                        onChange={(e) => onUpdateRecipe({ name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.blendConfig.batchSize}</label>
                    <div className="relative">
                        <NumberInput
                            className="w-full p-2 pr-8 border border-slate-300 rounded-md"
                            value={recipe.totalBatchWeightKg}
                            onChange={(v) => onUpdateRecipe({ totalBatchWeightKg: v })}
                            step={0.5}
                        />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">{t.common.unitKg}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {recipe.ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex gap-4 items-end bg-slate-50 p-3 rounded-lg border border-slate-100 relative group animate-in slide-in-from-top-1">
                        <div className="flex-grow">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">{t.blendConfig.ingredientName} {index + 1}</label>
                            <input
                                type="text"
                                className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                value={ingredient.name}
                                onChange={(e) => onUpdateIngredient(ingredient.id, { name: e.target.value })}
                            />
                        </div>

                        <div className="w-28">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">¥ / kg</label>
                            <NumberInput
                                className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                value={ingredient.pricePerKg}
                                onChange={(v) => onUpdateIngredient(ingredient.id, { pricePerKg: v })}
                                step={100}
                            />
                        </div>

                        <div className="w-24">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">{t.blendConfig.ratio}</label>
                            <NumberInput
                                className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                value={ingredient.ratio}
                                onChange={(v) => onUpdateIngredient(ingredient.id, { ratio: v })}
                                step={5}
                            />
                        </div>

                        {recipe.ingredients.length > 1 && (
                            <button
                                onClick={() => onRemoveIngredient(ingredient.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className={`flex items-center gap-1 font-medium ${isInvalidRatio ? 'text-red-600' : 'text-slate-800'}`}>
                        {isInvalidRatio && <AlertTriangle size={14} />}
                        {t.blendConfig.totalRatio}: {totalRatio}%
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>{t.blendConfig.totalCost}: <span className="font-medium text-slate-800">¥ {Math.round(totalCost).toLocaleString()}</span></span>
                </div>
                <button
                    onClick={onAddIngredient}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    {t.blendConfig.addIngredient}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-100">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t.beanConfig.targetRateRetail} <span className="float-right font-bold text-blue-600">{recipe.targetRateRetail}%</span>
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="80"
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        value={recipe.targetRateRetail}
                        onChange={(e) => onUpdateRecipe({ targetRateRetail: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t.beanConfig.targetRateWholesale} <span className="float-right font-bold text-slate-600">{recipe.targetRateWholesale}%</span>
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="80"
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                        value={recipe.targetRateWholesale}
                        onChange={(e) => onUpdateRecipe({ targetRateWholesale: Number(e.target.value) })}
                    />
                </div>
            </div>
        </div>
    );
};
