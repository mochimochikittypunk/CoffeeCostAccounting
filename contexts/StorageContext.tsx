'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { createSupabaseClient } from '../lib/supabaseClient';
import { Bean, GlobalSettings, FeeSettings, BlendRecipe, InventoryItem, InventoryOperationLog, SetProduct, UserProfile } from '../types';
import { aggregateMonthlyRoasting } from '../utils/inventoryCalculations';

// localStorage keys
const STORAGE_KEYS = {
    INVENTORY: 'coffee-simulator-inventory',
    BEANS: 'coffee-simulator-beans',
    BLEND: 'coffee-simulator-blend',
    GLOBAL_SETTINGS: 'coffee-simulator-global-settings',
    FEE_SETTINGS: 'coffee-simulator-fee-settings',
    HISTORY: 'coffee-simulator-inventory-history',
    SET_PRODUCT: 'coffee-simulator-set-product',
};

interface StorageContextType {
    // Single Origin State
    beans: Bean[];
    setBeans: React.Dispatch<React.SetStateAction<Bean[]>>;
    activeBeanId: string;
    setActiveBeanId: React.Dispatch<React.SetStateAction<string>>;

    // Blend State
    blendRecipe: BlendRecipe;
    setBlendRecipe: React.Dispatch<React.SetStateAction<BlendRecipe>>;

    // Set Product State
    setProduct: SetProduct;
    setSetProduct: React.Dispatch<React.SetStateAction<SetProduct>>;

    // Shared Settings
    globalSettings: GlobalSettings;
    setGlobalSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
    feeSettings: FeeSettings;
    setFeeSettings: React.Dispatch<React.SetStateAction<FeeSettings>>;

    // Inventory State
    inventory: InventoryItem[];
    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'registeredAt'>) => Promise<void>;
    updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
    consumeInventory: (id: string, amountKg: number) => Promise<void>;
    removeInventoryItem: (id: string) => Promise<void>;

    // History
    inventoryHistory: InventoryOperationLog[];
    undoOperation: (logId: string) => void;

    // User Profile
    userProfile: UserProfile | null;
    updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;

    // Credits
    credits: number;
    debugLog?: string;

    // Hydration status
    isHydrated: boolean;
    isSupabaseConnected: boolean;

    // Feature Usage Tracking
    logFeatureUsage: (featureName: 'single_origin' | 'blend' | 'set' | 'inventory') => Promise<void>;

    // Monthly Roasting Data
    monthlyRoastingData: { month: string; totalKg: number }[];
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

const initialSetProduct: SetProduct = {
    id: 'set-1',
    name: 'New Set Product',
    items: [],
    sellingPrice: 3000,
    plannedQuantity: 1,
    packagingCost: 0,
    utilityCost: 0,
    isTaxable: false,
    taxRate: 10,
    roastLossRate: 0,
    handpickLossRate: 0,
    shippingCost: 0,
    platformFeeRate: 0,
    platformFeeFixed: 0,
    platformName: 'Custom'
};

const initialGlobalSettings: GlobalSettings = {
    salesUnitG: 100,
    taxRate: 8,
    roastLossRate: 20,
    handpickLossRate: 0,
    utilityCostPerRoast: 0,
    utilityBatchSizeKg: 1,
    packagingCost: 0,
    isTaxableEntity: false
};

const initialFeeSettings: FeeSettings = {
    saleType: 'IN_STORE',
    paymentMethod: 'CASH',
    platformType: 'BASE_STANDARD',
    customFeeRate: 3.24,
    shippingCost: 0
};

// Helper to safely parse localStorage
function getStoredValue<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
}

// Mapper: DB (Snake) -> App (Camel)
const dbToLocal = (dbItem: any): InventoryItem => ({
    id: dbItem.id,
    name: dbItem.name,
    stockWeightKg: dbItem.stock_weight_kg,
    costPricePerKg: dbItem.cost_price_per_kg,
    retailPrice: dbItem.retail_price || 0,
    wholesalePrice: dbItem.wholesale_price || 0,
    registeredAt: dbItem.created_at,
    description: dbItem.description || undefined,
    composition: dbItem.composition || undefined, // JSONB
});

// Mapper: App (Camel) -> DB (Snake)
const localToDb = (item: Partial<InventoryItem>) => ({
    name: item.name,
    stock_weight_kg: item.stockWeightKg,
    cost_price_per_kg: item.costPricePerKg,
    retail_price: item.retailPrice,
    wholesale_price: item.wholesalePrice,
    description: item.description,
    composition: item.composition,
});

export const StorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Auth
    const { user } = useUser();
    const { getToken } = useAuth();
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

    // Feature States
    const [credits, setCredits] = useState<number>(0);

    // Initialize with default values for SSR consistency
    const [beans, setBeans] = useState<Bean[]>(initialBeans);
    const [activeBeanId, setActiveBeanId] = useState<string>('bean-1');
    const [blendRecipe, setBlendRecipe] = useState<BlendRecipe>(initialRecipe);
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(initialGlobalSettings);
    const [feeSettings, setFeeSettings] = useState<FeeSettings>(initialFeeSettings);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [inventoryHistory, setInventoryHistory] = useState<InventoryOperationLog[]>([]);
    const [monthlyRoastingData, setMonthlyRoastingData] = useState<{ month: string; totalKg: number }[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [setProduct, setSetProduct] = useState<SetProduct>(initialSetProduct);
    const [isHydrated, setIsHydrated] = useState(false);

    // 1. Hydrate from localStorage (Initial Load)
    useEffect(() => {
        setBeans(getStoredValue(STORAGE_KEYS.BEANS, initialBeans));
        setBlendRecipe(getStoredValue(STORAGE_KEYS.BLEND, initialRecipe));
        setGlobalSettings(getStoredValue(STORAGE_KEYS.GLOBAL_SETTINGS, initialGlobalSettings));
        setFeeSettings(getStoredValue(STORAGE_KEYS.FEE_SETTINGS, initialFeeSettings));
        // inventory is loaded from Supabase only
        setInventory([]);
        setInventoryHistory([]);
        setMonthlyRoastingData([]);
        setUserProfile(null);
        setSetProduct(getStoredValue(STORAGE_KEYS.SET_PRODUCT, initialSetProduct));
        setIsHydrated(true);
    }, []);

    // 2. Supabase Sync & Profile Initialization
    useEffect(() => {
        const syncWithSupabase = async () => {
            if (!user || !isHydrated) {
                setIsSupabaseConnected(false);
                setCredits(0);
                setUserProfile(null);

                // Clear all data on logout
                setInventory([]);
                setBeans(initialBeans);
                setActiveBeanId('bean-1');
                setBlendRecipe(initialRecipe);
                setGlobalSettings(initialGlobalSettings);
                setFeeSettings(initialFeeSettings);
                setSetProduct(initialSetProduct);
                setInventoryHistory([]);
                setMonthlyRoastingData([]);
                return;
            }

            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createSupabaseClient(token);
                setIsSupabaseConnected(true);

                // A. Initialize User / Profile
                const { data: profileResult, error: profileError } = await supabase.rpc('initialize_user_with_credits');

                if (profileError) {
                    console.error('Failed to init user:', profileError);
                } else if (profileResult) {
                    setCredits(profileResult.credits);
                    // Set Profile State
                    setUserProfile({
                        id: profileResult.id,
                        userId: profileResult.user_id,
                        credits: profileResult.credits,
                        displayName: profileResult.display_name,
                        shopName: profileResult.shop_name,
                        roasterMachine: profileResult.roaster_machine,
                        roasterSize: profileResult.roaster_size,
                        lastActiveAt: profileResult.last_active_at,
                        latest_rating: profileResult.latest_rating,
                        reminder_sent_at: profileResult.reminder_sent_at
                    });

                    // Update last_active_at
                    await supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('user_id', user.id);
                }

                // B. Fetch Inventory
                const { data: remoteInventory, error: invError } = await supabase
                    .from('inventory')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (invError) {
                    console.error('Failed to fetch inventory:', invError);
                } else if (remoteInventory) {
                    setInventory(remoteInventory.map(dbToLocal));
                }

                // C. Fetch remote history data
                const { data: remoteHistory, error: historyError } = await supabase
                    .from('inventory_history')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (historyError) {
                    console.error('Failed to fetch history:', historyError);
                } else if (remoteHistory) {
                    setInventoryHistory(remoteHistory.map((h: any) => ({
                        id: h.id,
                        timestamp: h.created_at,
                        type: h.type as any,
                        itemId: h.inventory_item_id || 'unknown',
                        itemName: h.name,
                        amountDelta: h.amount_delta,
                        relatedLogIds: [] // Supabase scheme might not return this out of the box unless joined, so keeping it simple
                    })));
                }

                // D. Fetch last 12 months consumption for analytics
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                oneYearAgo.setDate(1); // Set to start of the month 1 year ago

                const { data: consumptionData, error: consumptionError } = await supabase
                    .from('inventory_history')
                    .select('*')
                    .eq('type', 'CONSUME')
                    .gte('created_at', oneYearAgo.toISOString())
                    .order('created_at', { ascending: false });

                if (consumptionError) {
                    console.error('Failed to fetch consumption data:', consumptionError);
                    setMonthlyRoastingData(aggregateMonthlyRoasting([]));
                } else {
                    const logsData = consumptionData || [];
                    const consumptionLogs: InventoryOperationLog[] = logsData.map((h: any) => ({
                         id: h.id,
                         timestamp: h.created_at,
                         type: h.type as any,
                         itemId: h.inventory_item_id || 'unknown',
                         itemName: h.item_name || 'unknown',
                         amountDelta: h.amount_delta,
                    }));
                    setMonthlyRoastingData(aggregateMonthlyRoasting(consumptionLogs));
                }

            } catch (err: any) {
                console.error('Supabase Sync Error:', err);
                setIsSupabaseConnected(false);
            }
        };

        syncWithSupabase();
    }, [user, isHydrated, getToken]);

    // Update User Profile Function
    const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
        if (!user || !isSupabaseConnected) return;

        // Optimistic Update
        setUserProfile(prev => prev ? { ...prev, ...updates } : null);

        try {
            const token = await getToken({ template: 'supabase' });
            const supabase = createSupabaseClient(token);

            const dbUpdates: Record<string, string | number | undefined> = {};
            if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
            if (updates.shopName !== undefined) dbUpdates.shop_name = updates.shopName;
            if (updates.roasterMachine !== undefined) dbUpdates.roaster_machine = updates.roasterMachine;
            if (updates.roasterSize !== undefined) dbUpdates.roaster_size = updates.roasterSize;
            if (updates.latest_rating !== undefined) dbUpdates.latest_rating = updates.latest_rating;
            if (updates.reminder_sent_at !== undefined) dbUpdates.reminder_sent_at = updates.reminder_sent_at;

            if (Object.keys(dbUpdates).length > 0) {
                const { error } = await supabase
                    .from('profiles')
                    .update(dbUpdates)
                    .eq('user_id', user.id);

                if (error) throw error;
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            // Could revert optimistic update here if needed
        }
    }, [user, isSupabaseConnected, getToken]);

    // Log feature usage to Supabase
    const logFeatureUsage = useCallback(async (featureName: 'single_origin' | 'blend' | 'set' | 'inventory') => {
        if (!user || !isSupabaseConnected) return;

        try {
            const token = await getToken({ template: 'supabase' });
            const supabase = createSupabaseClient(token);

            await supabase.from('feature_usage').insert({
                user_id: user.id,
                feature_name: featureName
            });
        } catch (err) {
            // Silently fail - feature tracking is non-critical
            console.warn('Failed to log feature usage:', err);
        }
    }, [user, isSupabaseConnected, getToken]);

    // 3. Persistence (Local Storage specific - maintain for settings/beans)
    // Note: Inventory is now strictly Supabase-only, so we don't save it to localStorage anymore.

    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(STORAGE_KEYS.BEANS, JSON.stringify(beans));
        } catch (e) {
            console.warn('Failed to save beans to localStorage:', e);
        }
    }, [beans, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(STORAGE_KEYS.BLEND, JSON.stringify(blendRecipe));
        } catch (e) {
            console.warn('Failed to save blend to localStorage:', e);
        }
    }, [blendRecipe, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(STORAGE_KEYS.GLOBAL_SETTINGS, JSON.stringify(globalSettings));
        } catch (e) {
            console.warn('Failed to save global settings to localStorage:', e);
        }
    }, [globalSettings, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(STORAGE_KEYS.FEE_SETTINGS, JSON.stringify(feeSettings));
        } catch (e) {
            console.warn('Failed to save fee settings to localStorage:', e);
        }
    }, [feeSettings, isHydrated]);

    // Note: Inventory History is now session-only or server-synced (future), so we don't save it to localStorage for security.
    /*
    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(inventoryHistory));
        } catch (e) {
            console.warn('Failed to save inventory history to localStorage:', e);
        }
    }, [inventoryHistory, isHydrated]);
    */

    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(STORAGE_KEYS.SET_PRODUCT, JSON.stringify(setProduct));
        } catch (e) {
            console.warn('Failed to save set product to localStorage:', e);
        }
    }, [setProduct, isHydrated]);

    // Helper to add log
    const addLog = useCallback((
        type: InventoryOperationLog['type'],
        item: InventoryItem,
        amountDelta: number,
        relatedLogIds: string[] = []
    ) => {
        const newLog: InventoryOperationLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type,
            itemId: item.id,
            itemName: item.name,
            amountDelta,
            relatedLogIds
        };
        setInventoryHistory(prev => [newLog, ...prev].slice(0, 50));
    }, []);

    // Operations
    const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'registeredAt'>) => {
        // Optimistic update locally
        const tempId = `temp-${Date.now()}`;
        const newItem: InventoryItem = {
            ...item,
            id: tempId,
            registeredAt: new Date().toISOString(),
        };
        setInventory(prev => [...prev, newItem]);

        // Log locally first for responsiveness
        const tempLog: InventoryOperationLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'ADD',
            itemId: tempId,
            itemName: newItem.name,
            amountDelta: newItem.stockWeightKg
        };
        setInventoryHistory(prev => [tempLog, ...prev]);

        if (user && isSupabaseConnected) {
            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createSupabaseClient(token);

                // 1. Insert Item
                const { data, error } = await supabase
                    .from('inventory')
                    .insert({ ...localToDb(item), user_id: user.id })
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    const savedItem = dbToLocal(data);

                    // Replace temp item with real one
                    setInventory(prev => prev.map(i => i.id === tempId ? savedItem : i));

                    // 2. Log History to Supabase
                    await supabase.from('inventory_history').insert({
                        user_id: user.id,
                        inventory_item_id: savedItem.id,
                        item_name: savedItem.name,
                        type: 'ADD',
                        amount_delta: savedItem.stockWeightKg
                    });
                }
            } catch (err) {
                console.error('Failed to add to Supabase', err);
                // Revert optimistic update? Or show error? 
                // For now, allow it to remain local-only until refreshed if erratic.
            }
        }
    }, [user, isSupabaseConnected, getToken]);

    const updateInventoryItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
        setInventory(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));

        if (user && isSupabaseConnected && !id.startsWith('temp-')) {
            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createSupabaseClient(token);
                await supabase
                    .from('inventory')
                    .update(localToDb(updates))
                    .eq('id', id);
            } catch (err) {
                console.error('Failed to update Supabase', err);
            }
        }
    }, [user, isSupabaseConnected, getToken]);

    const consumeInventory = useCallback(async (id: string, amountKg: number) => {
        const targetItem = inventory.find(i => i.id === id);
        if (!targetItem) return;

        const newStock = Math.max(0, targetItem.stockWeightKg - amountKg);
        const actualConsumed = targetItem.stockWeightKg - newStock;

        let ingredientsToReduce: { id: string; amount: number }[] = [];

        if (targetItem.composition && targetItem.composition.length > 0) {
            ingredientsToReduce = targetItem.composition.map(comp => {
                let matchedInventoryId = comp.inventoryItemId;
                if (!matchedInventoryId) {
                    const matchedItem = inventory.find(i => i.name === comp.name);
                    if (matchedItem) matchedInventoryId = matchedItem.id;
                }
                if (!matchedInventoryId) return null;
                return {
                    id: matchedInventoryId,
                    amount: amountKg * (comp.ratio / 100)
                };
            }).filter((ing): ing is { id: string; amount: number } => !!ing);
        }

        const nextInventory = inventory.map(item => {
            if (item.id === id) return { ...item, stockWeightKg: newStock };
            const ingredientReduction = ingredientsToReduce.find(i => i.id === item.id);
            if (ingredientReduction) {
                const reducedStock = Math.max(0, item.stockWeightKg - ingredientReduction.amount);
                return { ...item, stockWeightKg: Math.round(reducedStock * 1000) / 1000 };
            }
            return item;
        });

        const mainLogId = `log-${Date.now()}-${id}`;
        const relatedLogs: InventoryOperationLog[] = ingredientsToReduce.map(ing => {
            const ingItem = inventory.find(i => i.id === ing.id);
            return {
                id: `log-${Date.now()}-${ing.id}`,
                timestamp: new Date().toISOString(),
                type: 'CONSUME',
                itemId: ing.id,
                itemName: ingItem?.name || 'Unknown',
                amountDelta: -ing.amount,
                relatedLogIds: [mainLogId]
            };
        });

        const mainLog: InventoryOperationLog = {
            id: mainLogId,
            timestamp: new Date().toISOString(),
            type: 'CONSUME',
            itemId: targetItem.id,
            itemName: targetItem.name,
            amountDelta: -actualConsumed,
            relatedLogIds: relatedLogs.map(l => l.id)
        };

        setInventory(nextInventory);
        setInventoryHistory(prev => [mainLog, ...relatedLogs, ...prev].slice(0, 50));

        if (user && isSupabaseConnected) {
            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createSupabaseClient(token);

                // 1. Update Stock in DB
                const p1 = supabase.from('inventory').update({ stock_weight_kg: newStock }).eq('id', id);
                const p2 = ingredientsToReduce.map(ing => {
                    const targetIng = nextInventory.find(i => i.id === ing.id);
                    if (targetIng) {
                        return supabase.from('inventory').update({ stock_weight_kg: targetIng.stockWeightKg }).eq('id', ing.id);
                    }
                });

                await Promise.all([p1, ...p2]);

                // 2. Insert Log to Supabase
                // Main log
                await supabase.from('inventory_history').insert({
                    user_id: user.id,
                    inventory_item_id: id,
                    item_name: targetItem.name,
                    type: 'CONSUME',
                    amount_delta: -actualConsumed
                });

                // Related logs (ingredients)
                if (relatedLogs.length > 0) {
                    await Promise.all(relatedLogs.map(log =>
                        supabase.from('inventory_history').insert({
                            user_id: user.id,
                            inventory_item_id: log.itemId,
                            item_name: log.itemName,
                            type: 'CONSUME',
                            amount_delta: log.amountDelta
                        })
                    ));
                }
                
                // Optimistically update monthly roasting data
                setMonthlyRoastingData(prev => {
                     const fakeLogs: InventoryOperationLog[] = [mainLog, ...relatedLogs];
                     // It is not completely accurate as we need all logs, but it updates the current month.
                     // A safe way is to refetch, but here we just append logic
                     const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                     const totalNewConsumption = fakeLogs.reduce((acc, log) => acc + Math.abs(log.amountDelta), 0);
                     return prev.map(data => {
                         if (data.month === currentMonth) {
                             return { ...data, totalKg: data.totalKg + totalNewConsumption };
                         }
                         return data;
                     })
                });

            } catch (err) {
                console.error('Failed to sync consumption to Supabase', err);
            }
        }
    }, [inventory, user, isSupabaseConnected, getToken]);

    const removeInventoryItem = useCallback(async (id: string) => {
        const target = inventory.find(i => i.id === id);

        // Optimistic
        setInventory(current => current.filter(item => item.id !== id));
        if (target) {
            const log: InventoryOperationLog = {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'DELETE',
                itemId: id,
                itemName: target.name,
                amountDelta: -target.stockWeightKg
            };
            setInventoryHistory(prev => [log, ...prev].slice(0, 50));
        }

        if (user && isSupabaseConnected && !id.startsWith('temp-')) {
            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createSupabaseClient(token);
                await supabase.from('inventory').delete().eq('id', id);

                if (target) {
                    await supabase.from('inventory_history').insert({
                        user_id: user.id,
                        inventory_item_id: null, // Setting null as item is deleted, or keep it? Schema has "on delete set null"
                        item_name: target.name, // Keep name for record
                        type: 'DELETE',
                        amount_delta: -target.stockWeightKg
                    });
                }
            } catch (err) {
                console.error('Failed to delete from Supabase', err);
            }
        }
    }, [inventory, user, isSupabaseConnected, getToken]);

    const undoOperation = useCallback(async (logId: string) => {
        const logToUndo = inventoryHistory.find(l => l.id === logId);
        if (!logToUndo) return;

        const logsToUndoIds = new Set<string>([logId]);
        if (logToUndo.relatedLogIds) logToUndo.relatedLogIds.forEach(id => logsToUndoIds.add(id));
        const logsToUndo = inventoryHistory.filter(l => logsToUndoIds.has(l.id));

        setInventory(currentInventory => {
            const nextInv = currentInventory.map(item => {
                const relevantLogs = logsToUndo.filter(l => l.itemId === item.id);
                if (relevantLogs.length === 0) return item;
                let newStock = item.stockWeightKg;
                relevantLogs.forEach(log => newStock -= log.amountDelta);
                newStock = Math.max(0, newStock);

                if (user && isSupabaseConnected && !item.id.startsWith('temp-')) {
                    const tokenPromise = getToken({ template: 'supabase' });
                    tokenPromise.then(token => {
                        const supabase = createSupabaseClient(token);
                        supabase.from('inventory').update({ stock_weight_kg: Math.round(newStock * 1000) / 1000 }).eq('id', item.id).then();
                    });
                }

                return { ...item, stockWeightKg: Math.round(newStock * 1000) / 1000 };
            });
            return nextInv;
        });

        // Optimistic update local history
        setInventoryHistory(currentHistory => currentHistory.filter(l => !logsToUndoIds.has(l.id)));

        // Sync delete to Supabase
        if (user && isSupabaseConnected) {
            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createSupabaseClient(token);

                await supabase
                    .from('inventory_history')
                    .delete()
                    .in('id', Array.from(logsToUndoIds));
            } catch (err) {
                console.error('Failed to sync undo to Supabase:', err);
            }
        }
    }, [inventoryHistory, user, isSupabaseConnected, getToken]);

    return (
        <StorageContext.Provider value={{
            beans, setBeans,
            activeBeanId, setActiveBeanId,
            blendRecipe, setBlendRecipe,
            setProduct, setSetProduct,
            globalSettings, setGlobalSettings,
            feeSettings, setFeeSettings,
            inventory,
            addInventoryItem,
            updateInventoryItem,
            consumeInventory,
            removeInventoryItem,

            // History
            inventoryHistory,
            undoOperation,

            // Profile
            userProfile,
            updateUserProfile,
            credits,
            isHydrated,
            isSupabaseConnected,
            logFeatureUsage,
            monthlyRoastingData
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
