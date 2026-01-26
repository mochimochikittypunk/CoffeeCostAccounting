'use client';

import React, { useState, useEffect, useRef } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    className = "",
    ...props
}) => {
    // Initialize with string representation of value, but treat 0 as "0" initially
    const [inputValue, setInputValue] = useState<string>(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync from parent value if it changes externally
    // We check if the parsed internal value matches the parent value to avoid 
    // overwriting transient states like "0." or "1.0" or ""
    useEffect(() => {
        const isFocused = document.activeElement === inputRef.current;
        const parsedCurrent = parseFloat(inputValue);
        const safeParsed = isNaN(parsedCurrent) ? 0 : parsedCurrent;

        // If parent value is different from what we reasoned, update.
        // Exception: If we are focused and the difference is just formatting (e.g. 1.0 vs 1), ignore.
        // But if parent changes significantly (different logic), sync.
        if (value !== safeParsed) {
            // Only sync if not focused, OR if the mismatch is real (logic change)
            // Simpler rule: Always sync if not focused. 
            // If focused, only sync if value is really different? 
            // Actually, for a calculator, parent might recalculate. 
            // But usually inputs drive the calc. 
            // Let's trust local state while focused unless parent force override?
            // For now, let's sync if not focused.
            if (!isFocused) {
                setInputValue(value.toString());
            }
        }
    }, [value, inputValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValueStr = e.target.value;
        setInputValue(newValueStr);

        if (newValueStr === '') {
            onChange(0);
            return;
        }

        const parsed = parseFloat(newValueStr);
        if (!isNaN(parsed)) {
            onChange(parsed);
        }
    };

    const handleBlur = () => {
        // On blur, strictly format back to the numeric value to clean up "00" or "." (if invalid)
        setInputValue(value.toString());
    };

    return (
        <input
            ref={inputRef}
            type="number"
            className={className}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
        />
    );
};
