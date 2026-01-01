import React from 'react';
import { TextField, FormHelperText, Box } from '@mui/material';
import { inputStyles, errorTextStyles } from './RateInput.styles';

export interface RateInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Pure presentation component for rate input
 * Handles numeric input validation at the event level
 * No side effects - only accepts props and calls onChange callback
 */
export const RateInput = React.memo(
  ({
    label,
    value,
    onChange,
    error,
    min,
    max,
    step,
    disabled = false,
    required = false,
  }: RateInputProps) => {
    const inputId = React.useId();
    const errorId = React.useId();
    const hasError = !!error;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    };

    return (
      <Box sx={inputStyles.container}>
        <TextField
          id={inputId}
          label={label}
          type="number"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          error={hasError}
          inputProps={{
            min,
            max,
            step: step || 0.01,
            'aria-invalid': hasError ? 'true' : 'false',
            'aria-describedby': hasError ? errorId : undefined,
          }}
          fullWidth
          sx={inputStyles.input}
        />
        {hasError && (
          <FormHelperText id={errorId} error sx={errorTextStyles.error}>
            {error}
          </FormHelperText>
        )}
      </Box>
    );
  }
);

RateInput.displayName = 'RateInput';
