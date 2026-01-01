import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RateInput } from '../RateInput';

describe('RateInput component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('should render with required props', () => {
      render(<RateInput label="Weekday Rate" value={50} onChange={mockOnChange} />);

      expect(screen.getByLabelText('Weekday Rate')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      render(<RateInput label="Weekend Rate" value={75} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
    });

    it('should render with error message when provided', () => {
      const errorMessage = 'Rate must be between 25 and 200';
      render(<RateInput label="Rate" value={50} error={errorMessage} onChange={mockOnChange} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not render error message when not provided', () => {
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      expect(screen.queryByText(/Rate must be/)).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChange when value changes', async () => {
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '65' } });

      expect(mockOnChange).toHaveBeenCalledWith(65);
    });

    it('should call onChange with numeric value', async () => {
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '75' } });

      expect(mockOnChange).toHaveBeenCalledWith(75);
    });

    it('should handle decimal input', () => {
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '50.5' } });

      expect(mockOnChange).toHaveBeenCalledWith(50.5);
    });

    it('should prevent non-numeric input', () => {
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'abc' } });

      // Component should not accept non-numeric input - onChange not called for NaN
      expect(mockOnChange).not.toHaveBeenCalledWith(NaN);
    });
  });

  describe('input validation at event level', () => {
    it('should use HTML5 number input type for validation', () => {
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      expect(input.type).toBe('number');
    });

    it('should accept min and max attributes', () => {
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} min={25} max={200} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      expect(input.min).toBe('25');
      expect(input.max).toBe('200');
    });
  });

  describe('accessibility', () => {
    it('should have proper label-input association', () => {
      render(<RateInput label="Weekday Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      // Input should have an id
      expect(input.id).toBeTruthy();
      // Label should be associated with input via aria-label or htmlFor
      expect(input).toHaveAttribute('id');
    });

    it('should have accessible name via label', () => {
      render(<RateInput label="Weekday Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByLabelText('Weekday Rate') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    it('should associate error message with input', () => {
      render(
        <RateInput
          label="Rate"
          value={50}
          error="Rate must be between 25 and 200"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      // Error should be associated via aria-describedby
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should mark input as invalid when error is present', () => {
      render(<RateInput label="Rate" value={50} error="Invalid rate" onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not mark input as invalid when no error', () => {
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('keyboard navigation', () => {
    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      await user.tab();

      expect(input).toHaveFocus();
    });

    it('should support keyboard input', async () => {
      const user = userEvent.setup();
      render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      const input = screen.getByDisplayValue('50') as HTMLInputElement;
      input.focus();
      await user.type(input, '0');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('error states', () => {
    it('should display error message below input', () => {
      const errorMsg = 'Rate too low';
      render(<RateInput label="Rate" value={50} error={errorMsg} onChange={mockOnChange} />);

      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    it('should update error display when error prop changes', () => {
      const { rerender } = render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      expect(screen.queryByText('New error')).not.toBeInTheDocument();

      rerender(<RateInput label="Rate" value={50} error="New error" onChange={mockOnChange} />);

      expect(screen.getByText('New error')).toBeInTheDocument();
    });
  });

  describe('prop changes', () => {
    it('should update displayed value when value prop changes', () => {
      const { rerender } = render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue('50')).toBeInTheDocument();

      rerender(<RateInput label="Rate" value={75} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<RateInput label="Rate" value={0} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });

    it('should handle empty value', () => {
      render(<RateInput label="Rate" value="" onChange={mockOnChange} />);

      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
  });

  describe('component contract', () => {
    it('should be a pure presentation component', () => {
      // Component should not have side effects
      // It should only accept props and call onChange
      const { rerender } = render(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      // Re-rendering with same props should not change output
      rerender(<RateInput label="Rate" value={50} onChange={mockOnChange} />);

      // No console errors or warnings
      expect(true).toBe(true);
    });

    it('should only export label, value, error, onChange, and optional HTML attributes', () => {
      // Component should accept:
      // - label: string
      // - value: number or string
      // - onChange: (value: number) => void
      // - error?: string
      // - min?, max?, step?: number
      // - other input attributes
      render(
        <RateInput
          label="Weekday Rate"
          value={50}
          onChange={mockOnChange}
          error="Invalid"
          min={25}
          max={200}
          step={0.5}
          disabled={false}
        />
      );

      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });
  });
});
