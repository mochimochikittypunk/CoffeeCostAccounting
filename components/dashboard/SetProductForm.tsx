'use client';

import React, { useState } from 'react';
import { SetProduct, SetProductItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStorage } from '../../contexts/StorageContext';
import { NumberInput } from '../ui/NumberInput';
import { Trash2, Plus, AlertTriangle, ChevronDown, Package, Settings } from 'lucide-react';

interface SetProductFormProps {
    product: SetProduct;
    onUpdateProduct: (updates: Partial<SetProduct>) => void;
    onUpdateItem: (id: string, updates: Partial<SetProductItem>) => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
}

export const SetProductForm: React.FC<SetProductFormProps> = ({
    product,
    onUpdateProduct,
    onUpdateItem,
    onAddItem,
    onRemoveItem
}) => {
    const { t } = useLanguage();
    const { inventory } = useStorage();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Calculations
    // Calculations
    const totalListPrice = product.items.reduce((sum, i) => sum + (i.retailPricePerKg * (i.quantity / 1000)), 0);

    // Material Cost (Sum of item costs with Loss Rates)
    const roastLossMultiplier = 1 / (1 - (product.roastLossRate || 0) / 100);
    const handpickLossMultiplier = 1 / (1 - (product.handpickLossRate || 0) / 100);
    const totalLossMultiplier = roastLossMultiplier * handpickLossMultiplier;

    const totalMaterialCost = product.items.reduce((sum, i) => {
        const itemCost = i.costPricePerKg * (i.quantity / 1000) * totalLossMultiplier;
        return sum + itemCost;
    }, 0);

    // Overheads
    const totalOverheads = (product.packagingCost || 0) + (product.utilityCost || 0) + (product.shippingCost || 0);

    // Fees
    const platformFeeAmount = (product.sellingPrice * ((product.platformFeeRate || 0) / 100)) + (product.platformFeeFixed || 0);

    // Final Calculation
    const totalCost = totalMaterialCost + totalOverheads + platformFeeAmount;

    // Derived values
    const discountAmount = totalListPrice - product.sellingPrice;
    const discountRate = totalListPrice > 0 ? (discountAmount / totalListPrice) * 100 : 0;

    const finalProfit = product.sellingPrice - totalCost;
    const finalProfitMargin = product.sellingPrice > 0 ? (finalProfit / product.sellingPrice) * 100 : 0;

    const profit = finalProfit;
    const profitMargin = finalProfitMargin;

    const handleSelectFromInventory = (itemId: string, inventoryItemId: string) => {
        const item = inventory.find(i => i.id === inventoryItemId);
        if (item) {
            onUpdateItem(itemId, {
                name: item.name,
                costPricePerKg: item.costPricePerKg,
                retailPricePerKg: item.retailPrice * 10, // Retail price is per 100g in inventory, so *10 for per kg
                inventoryItemId: item.id
            });
        }
        setOpenDropdown(null);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Package size={20} className="text-blue-600" />
                        {t.setProduct.title}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.setProduct.setName}</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded-md"
                            value={product.name}
                            onChange={(e) => onUpdateProduct({ name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {product.items.map((item, index) => (
                        <div key={item.id} className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-100 relative group animate-in slide-in-from-top-1">
                            <div className="flex-grow w-full md:w-auto">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.itemName} {index + 1}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full p-2 pr-8 text-sm border border-slate-200 rounded-md"
                                        value={item.name}
                                        onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                                        placeholder={t.inventory.selectHint}
                                    />
                                    {inventory.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                                            className="absolute right-1 top-1 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title={t.inventory.selectFromInventory}
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    )}
                                    {/* Dropdown */}
                                    {openDropdown === item.id && inventory.length > 0 && (
                                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            <div className="p-2 text-xs font-medium text-slate-500 border-b border-slate-100">
                                                📦 {t.inventory.selectFromInventory}
                                            </div>
                                            {inventory.map(invItem => (
                                                <button
                                                    key={invItem.id}
                                                    type="button"
                                                    onClick={() => handleSelectFromInventory(item.id, invItem.id)}
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex justify-between items-center"
                                                >
                                                    <span className="text-slate-900">{invItem.name}</span>
                                                    <span className="text-slate-500 text-xs">¥{invItem.costPricePerKg.toLocaleString()}/kg</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-24">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.weight}</label>
                                <NumberInput
                                    className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                    value={item.quantity}
                                    onChange={(v) => onUpdateItem(item.id, { quantity: v })}
                                    step={50}
                                />
                            </div>

                            <div className="w-full md:w-32">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.costPricePerKg}</label>
                                <NumberInput
                                    className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                    value={Math.round(item.costPricePerKg / 10)}
                                    onChange={(v) => onUpdateItem(item.id, { costPricePerKg: v * 10 })}
                                    step={10}
                                />
                            </div>

                            <div className="w-full md:w-32">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.listPricePerKg}</label>
                                <NumberInput
                                    className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                    value={Math.round(item.retailPricePerKg / 10)}
                                    onChange={(v) => onUpdateItem(item.id, { retailPricePerKg: v * 10 })}
                                    step={10}
                                />
                            </div>

                            <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors self-end"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={onAddItem}
                        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        {t.setProduct.addItem}
                    </button>
                </div>
            </div>






            {/* Analysis Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">{t.profitAnalysis.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Set Price Input and Summary */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t.setProduct.sellingPrice}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-400">¥</span>
                                <NumberInput
                                    className="w-full p-2 pl-8 border border-slate-300 rounded-md text-lg font-bold text-slate-900"
                                    value={product.sellingPrice}
                                    onChange={(v) => onUpdateProduct({ sellingPrice: v })}
                                    step={100}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">販売予定数量</label>
                            <div className="flex items-center gap-2">
                                <NumberInput
                                    className="flex-1 p-2 border border-slate-300 rounded-md text-lg font-bold text-slate-900"
                                    value={product.plannedQuantity || 1}
                                    onChange={(v) => onUpdateProduct({ plannedQuantity: Math.max(1, v) })}
                                    step={1}
                                />
                                <span className="text-slate-500 whitespace-nowrap">セット</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">{t.setProduct.totalListPrice}</div>
                                <div className="text-lg font-semibold text-slate-600 line-through">¥ {Math.round(totalListPrice * (product.plannedQuantity || 1)).toLocaleString()}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div className="text-xs text-blue-600 mb-1 font-medium">{t.setProduct.discountRate}</div>
                                <div className="text-2xl font-bold text-blue-700">{discountRate.toFixed(1)}% <span className="text-sm font-normal text-blue-500">OFF</span></div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100">
                            {/* Material Cost */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">{t.setProduct.totalCost} (材料費)</span>
                                <span className="font-medium text-slate-900">¥ {Math.round(totalMaterialCost * (product.plannedQuantity || 1)).toLocaleString()}</span>
                            </div>
                            {/* Overheads */}
                            <div className="flex justify-between items-center text-sm text-slate-500">
                                <span>+ {t.setProduct.overheads.title}</span>
                                <span>¥ {Math.round(totalOverheads * (product.plannedQuantity || 1)).toLocaleString()}</span>
                            </div>
                            {/* Fees */}
                            <div className="flex justify-between items-center text-sm text-slate-500">
                                <span>+ {t.setProduct.fees.title}</span>
                                <span>¥ {Math.round(platformFeeAmount * (product.plannedQuantity || 1)).toLocaleString()}</span>
                            </div>

                            <div className="border-b border-dashed border-slate-200 my-2"></div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold">{t.setProduct.finalProfit} ({product.plannedQuantity || 1}セット)</span>
                                <span className={`font-bold text-lg ${finalProfit * (product.plannedQuantity || 1) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ¥ {Math.round(finalProfit * (product.plannedQuantity || 1)).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">{t.setProduct.profitMargin}</span>
                                <span className={`font-bold ${finalProfitMargin >= 30 ? 'text-green-600' : finalProfitMargin > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {finalProfitMargin.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 mb-3">{t.setProduct.costBreakdown || '原価の内訳'}</h4>
                            <div className="space-y-2">
                                {product.items.map(item => {
                                    const itemCost = item.costPricePerKg * (item.quantity / 1000);
                                    const itemCostRate = product.sellingPrice > 0 ? (itemCost / product.sellingPrice) * 100 : 0;

                                    return (
                                        <div key={item.id} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-700 font-medium truncate max-w-[120px]">{item.name}</span>
                                                <span className="text-slate-400">({item.quantity}g)</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-600">¥{Math.round(itemCost).toLocaleString()}</span>
                                                <span className="text-slate-400 w-12 text-right">{itemCostRate.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual Bar Chart */}
                    <div className="flex flex-col justify-center h-full min-h-[200px] bg-slate-50 rounded-lg p-6 relative">
                        {totalListPrice > 0 ? (
                            <div className="w-full h-12 flex rounded-full overflow-hidden shadow-inner relative">
                                {/* Cost Part */}
                                <div
                                    className="bg-slate-400 h-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ width: `${Math.min(100, (totalCost / totalListPrice) * 100)}%` }}
                                >
                                    {(totalCost / totalListPrice) * 100 > 10 && `${Math.round((totalCost / totalListPrice) * 100)}%`}
                                </div>
                                {/* Profit Part */}
                                <div
                                    className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ width: `${Math.max(0, Math.min(100, (profit / totalListPrice) * 100))}%` }}
                                >
                                    {(profit / totalListPrice) * 100 > 10 && 'Profit'}
                                </div>
                                {/* Discount Part */}
                                <div
                                    className="bg-blue-200 h-full flex items-center justify-center text-blue-800 text-xs font-bold"
                                    style={{ width: `${Math.max(0, Math.min(100, (discountAmount / totalListPrice) * 100))}%` }}
                                >
                                    {(discountAmount / totalListPrice) * 100 > 10 && 'お得'}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 text-sm">
                                アイテムを追加すると分析が表示されます
                            </div>
                        )}

                        {totalListPrice > 0 && (
                            <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                                <span>原価: {Math.round((totalCost / totalListPrice) * 100)}%</span>
                                <span>利益率: {Math.round((finalProfit / product.sellingPrice) * 100)}% (売価対)</span>
                                <span>実質割引: {Math.round(discountRate)}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
