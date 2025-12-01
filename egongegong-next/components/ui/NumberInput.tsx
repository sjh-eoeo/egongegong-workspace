'use client';

import React, { useState, useCallback, useEffect, InputHTMLAttributes } from 'react';
import { formatNumber, formatInputNumber, parseFormattedNumber } from '@/lib/utils';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
}

/**
 * Number input component with thousand separator formatting
 */
export const NumberInput: React.FC<NumberInputProps> = ({ 
  defaultValue, 
  value: controlledValue, 
  onChange,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState(() => 
    formatNumber(controlledValue ?? defaultValue ?? 0)
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync displayValue with controlledValue when not focused
  useEffect(() => {
    if (!isFocused && controlledValue !== undefined) {
      setDisplayValue(formatNumber(controlledValue));
    }
  }, [controlledValue, isFocused]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatInputNumber(raw);
    setDisplayValue(formatted);
    
    if (onChange) {
      onChange(parseFormattedNumber(formatted));
    }
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Reformat on blur to ensure clean display
    if (controlledValue !== undefined) {
      setDisplayValue(formatNumber(controlledValue));
    }
  }, [controlledValue]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
};
