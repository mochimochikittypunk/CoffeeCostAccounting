'use client';

import React from 'react';
import { useStorage } from '../../contexts/StorageContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { InventoryOperationLog } from '../../types';
import { RotateCcw, Plus, Minus, Trash2, Edit } from 'lucide-react';

export const InventoryHistory: React.FC = () => {
    const { inventoryHistory, undoOperation } = useStorage();
    const { t, locale } = useLanguage();

    if (inventoryHistory.length === 0) {
        return null;
    }

    const getIcon = (type: InventoryOperationLog['type']) => {
        switch (type) {
            case 'ADD': return <Plus size={14} className="text-blue-600" />;
            case 'CONSUME': return <Minus size={14} className="text-amber-600" />;
            case 'DELETE': return <Trash2 size={14} className="text-red-600" />;
            case 'UPDATE': return <Edit size={14} className="text-slate-600" />;
            default: return null;
        }
    };

    const getLabel = (type: InventoryOperationLog['type']) => {
        switch (type) {
            case 'ADD': return t.inventory.opAdd;
            case 'CONSUME': return t.inventory.opConsume;
            case 'DELETE': return t.inventory.opDelete;
            case 'UPDATE': return t.inventory.opUpdate;
            default: return type;
        }
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-8">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                {t.inventory.historyTitle}
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {inventoryHistory.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="p-1 bg-white rounded shadow-sm">
                                {getIcon(log.type)}
                            </span>
                            <div>
                                <div className="font-medium text-slate-900">
                                    {log.itemName}
                                    <span className={`ml-2 text-xs font-bold ${log.amountDelta > 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                        {log.amountDelta > 0 ? '+' : ''}{log.amountDelta}kg
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 flex gap-2">
                                    <span>{getLabel(log.type)}</span>
                                    <span>•</span>
                                    <span>{new Date(log.timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')}</span>
                                    {log.relatedItemIds && log.relatedItemIds.length > 0 && (
                                        <>
                                            <span>•</span>
                                            <span className="text-slate-400">Linked</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Undo Button - Only for non-DELETE operations for now due to limitation */}
                        {log.type !== 'DELETE' && (
                            <button
                                onClick={() => undoOperation(log.id)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title={t.inventory.undoAction}
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
