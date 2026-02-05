'use client';

import React, { useState } from 'react';
import { useStorage } from '../../contexts/StorageContext';
import { SetProductForm } from '../../components/dashboard/SetProductForm';
import { SetProductSettings } from '../../components/dashboard/SetProductSettings';
import { SetProductItem } from '../../types';
import { FeatureGuard } from '../../components/auth/FeatureGuard';

export default function SetProductPage() {
    const { setProduct, setSetProduct, addInventoryItem } = useStorage();
    const [addedToInventory, setAddedToInventory] = useState(false);

    const handleUpdateProduct = (updates: Partial<typeof setProduct>) => {
        setSetProduct(prev => ({ ...prev, ...updates }));
    };

    const handleUpdateItem = (id: string, updates: Partial<SetProductItem>) => {
        setSetProduct(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
        }));
    };

    const handleAddItem = () => {
        const newItem: SetProductItem = {
            id: `item-${Date.now()}`,
            name: '',
            quantity: 200, // Default 200g
            retailPricePerKg: 8000,
            costPricePerKg: 4000
        };
        setSetProduct(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    const handleRemoveItem = (id: string) => {
        setSetProduct(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    // Calculate total weight and cost for inventory
    const totalWeightKg = setProduct.items.reduce((sum, item) => sum + (item.quantity / 1000), 0);
    const roastLossMultiplier = 1 / (1 - (setProduct.roastLossRate || 0) / 100);
    const handpickLossMultiplier = 1 / (1 - (setProduct.handpickLossRate || 0) / 100);
    const totalLossMultiplier = roastLossMultiplier * handpickLossMultiplier;
    const totalMaterialCost = setProduct.items.reduce((sum, i) => {
        return sum + (i.costPricePerKg * (i.quantity / 1000) * totalLossMultiplier);
    }, 0);
    const totalOverheads = (setProduct.packagingCost || 0) + (setProduct.utilityCost || 0) + (setProduct.shippingCost || 0);
    const platformFeeAmount = (setProduct.sellingPrice * ((setProduct.platformFeeRate || 0) / 100)) + (setProduct.platformFeeFixed || 0);
    const totalCost = totalMaterialCost + totalOverheads + platformFeeAmount;
    const costPerKg = totalWeightKg > 0 ? totalCost / totalWeightKg : 0;
    const retailPricePer100g = totalWeightKg > 0 ? (setProduct.sellingPrice / totalWeightKg) / 10 : 0;

    const handleAddToInventory = () => {
        if (setProduct.items.length === 0 || totalWeightKg === 0) return;

        const plannedQty = setProduct.plannedQuantity || 1;
        const totalStockWeight = totalWeightKg * plannedQty;

        // Create composition map for smart inventory consumption
        const composition = setProduct.items
            .filter(i => i.inventoryItemId && i.quantity > 0)
            .map(i => {
                const totalQty = setProduct.items.reduce((sum, item) => sum + item.quantity, 0);
                return {
                    inventoryItemId: i.inventoryItemId!,
                    name: i.name,
                    ratio: totalQty > 0 ? (i.quantity / totalQty) * 100 : 0
                };
            });

        addInventoryItem({
            name: setProduct.name || 'Unnamed Set',
            stockWeightKg: totalStockWeight,
            retailPrice: Math.round(retailPricePer100g),
            wholesalePrice: Math.round(retailPricePer100g * 8), // Wholesale at ~80% of retail
            costPricePerKg: Math.round(costPerKg),
            composition: composition.length > 0 ? composition : undefined
        });

        setAddedToInventory(true);

        setTimeout(() => {
            setAddedToInventory(false);
        }, 3000);
    };

    return (
        <FeatureGuard message="セット商品機能を利用するにはログインが必要です">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar (Settings) */}
                    <div className="lg:col-span-3 space-y-6">
                        <SetProductSettings
                            product={setProduct}
                            onUpdateProduct={handleUpdateProduct}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9 space-y-6">
                        <SetProductForm
                            product={setProduct}
                            onUpdateProduct={handleUpdateProduct}
                            onUpdateItem={handleUpdateItem}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                        />

                        {/* Add to Inventory Button */}
                        {setProduct.items.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <button
                                    onClick={handleAddToInventory}
                                    disabled={addedToInventory}
                                    className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${addedToInventory
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {addedToInventory ? '✓ 在庫に追加済み' : `📦 「${setProduct.name}」を在庫に追加`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </FeatureGuard>
    );
}
