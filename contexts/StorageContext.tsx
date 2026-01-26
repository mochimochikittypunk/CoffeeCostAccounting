'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bean, GlobalSettings, FeeSettings, BlendRecipe, BlendIngredient } from '../types';

interface StorageContextType {
    // Single Origin State
    beans: Bean[];
    setBeans: React.Dispatch<React.SetStateAction<Bean[]>>;
    activeBeanId: string;
    setActiveBeanId: React.Dispatch<React.SetStateAction<string>>;

    // Blend State
    blendRecipe: BlendRecipe;
    setBlendRecipe: React.Dispatch<React.SetStateAction<BlendRecipe>>;

    // Shared Settings
    globalSettings: GlobalSettings;
    setGlobalSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
    feeSettings: FeeSettings;
    setFeeSettings: React.Dispatch<React.SetStateAction<FeeSettings>>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Initial States
const initialBeans: Bean[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `bean-${i + 1}`,
    name: `Bean ${i + 1}`,
    purchasePrice: 0,
    purchaseWeightKg: 0,
    priceInputMode: 'active_total',
    targetRateRetail: 30,
    targetRateWholesale: 50
}));

const initialRecipe: BlendRecipe = {
    id: 'blend-1',
    name: 'My Signature Blend',
    ingredients: [
        { id: 'i-1', name: 'Brazil Santos', pricePerKg: 1500, ratio: 50 },
        { id: 'i-2', name: 'Columbia Supremo', pricePerKg: 1800, ratio: 50 }
    ],
    totalBatchWeightKg: 10,
    targetRateRetail: 30,
    targetRateWholesale: 50
};

const initialGlobalSettings: GlobalSettings = {
    salesUnitG: 100,
    taxRate: 8, // Consumption Tax 8%
    roastLossRate: 20,
    handpickLossRate: 0,
    utilityCostPerRoast: 0,
    packagingCost: 0,
    isTaxableEntity: false // Default: Tax Exempt
};

const initialFeeSettings: FeeSettings = {
    saleType: 'IN_STORE',
    paymentMethod: 'CASH',
    platformType: 'BASE_STANDARD',
    customFeeRate: 3.24,
    shippingCost: 0
};

export const StorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [beans, setBeans] = useState<Bean[]>(initialBeans);
    const [activeBeanId, setActiveBeanId] = useState<string>('bean-1');
    const [blendRecipe, setBlendRecipe] = useState<BlendRecipe>(initialRecipe);
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(initialGlobalSettings);
    const [feeSettings, setFeeSettings] = useState<FeeSettings>(initialFeeSettings);

    return (
        <StorageContext.Provider value={{
            beans, setBeans,
            activeBeanId, setActiveBeanId,
            blendRecipe, setBlendRecipe,
            globalSettings, setGlobalSettings,
            feeSettings, setFeeSettings
        }}>
            {children}
        </StorageContext.Provider>
    );
};

export const useStorage = () => {
    const context = useContext(StorageContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};
