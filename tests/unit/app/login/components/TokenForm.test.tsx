import { render, screen, fireEvent } from '@testing-library/react';
import { TokenForm } from '@/app/login/components/TokenForm';
import { TOKEN_INSTRUCTIONS } from '@/app/login/constants';

describe('TokenForm', () => {
  const mockOnSignIn = jest.fn();
  const mockOnTokenChange = jest.fn();
  const defaultProps = {
    isLoading: false,
    apiToken: '',
    tokenError: '',
    onTokenChange: mockOnTokenChange,
    onSignIn: mockOnSignIn,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render token input field', () => {
      render(<TokenForm {...defaultProps} />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i);
      expect(input).toBeInTheDocument();
    });

    it('should render sign-in button', () => {
      render(<TokenForm {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Sign in with API Token/i });
      expect(button).toBeInTheDocument();
    });

    it('should render info alert', () => {
      render(<TokenForm {...defaultProps} />);

      expect(screen.getByText(/Using an API token is simpler than OAuth/i)).toBeInTheDocument();
    });

    it('should render instructions section', () => {
      render(<TokenForm {...defaultProps} />);

      expect(screen.getByText('How to get your API Token:')).toBeInTheDocument();
    });

    it('should render all instructions from constants', () => {
      render(<TokenForm {...defaultProps} />);

      TOKEN_INSTRUCTIONS.forEach((instruction) => {
        expect(screen.getByText(new RegExp(instruction, 'i'))).toBeInTheDocument();
      });
    });
  });

  describe('Input behavior', () => {
    it('should call onTokenChange when typing', () => {
      render(<TokenForm {...defaultProps} />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i);
      fireEvent.change(input, { target: { value: 'test-token' } });

      expect(mockOnTokenChange).toHaveBeenCalledWith('test-token');
    });

    it('should display token value', () => {
      render(<TokenForm {...defaultProps} apiToken="my-token" />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i) as HTMLInputElement;
      expect(input.value).toBe('my-token');
    });

    it('should be password type for security', () => {
      render(<TokenForm {...defaultProps} />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should be disabled when loading', () => {
      render(<TokenForm {...defaultProps} isLoading={true} />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i);
      expect(input).toBeDisabled();
    });

    it('should show error state when tokenError is set', () => {
      render(<TokenForm {...defaultProps} tokenError="Invalid token" />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should call onSignIn when Enter key is pressed', () => {
      render(<TokenForm {...defaultProps} apiToken="test-token" />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i);
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    });

    it('should not call onSignIn when other keys are pressed', () => {
      render(<TokenForm {...defaultProps} apiToken="test-token" />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i);
      fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });

      expect(mockOnSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Button behavior', () => {
    it('should call onSignIn when button is clicked', () => {
      render(<TokenForm {...defaultProps} apiToken="test-token" />);

      const button = screen.getByRole('button', { name: /Sign in with API Token/i });
      fireEvent.click(button);

      expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when loading', () => {
      render(<TokenForm {...defaultProps} isLoading={true} apiToken="test-token" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when token is empty', () => {
      render(<TokenForm {...defaultProps} apiToken="" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when token is only whitespace', () => {
      render(<TokenForm {...defaultProps} apiToken="   " />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when token is valid', () => {
      render(<TokenForm {...defaultProps} apiToken="valid-token" />);

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
    });

    it('should show loading text when loading', () => {
      render(<TokenForm {...defaultProps} isLoading={true} apiToken="test-token" />);

      expect(screen.getByText('Verifying Token...')).toBeInTheDocument();
    });

    it('should show default text when not loading', () => {
      render(<TokenForm {...defaultProps} apiToken="test-token" />);

      expect(screen.getByText('Sign in with API Token')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should not show error alert initially', () => {
      render(<TokenForm {...defaultProps} />);

      const alerts = screen.queryAllByRole('alert');
      const errorAlert = alerts.find((alert) => alert.textContent?.includes('Invalid'));
      expect(errorAlert).toBeUndefined();
    });

    it('should show helper text when no error', () => {
      render(<TokenForm {...defaultProps} />);

      // Default helper text should be visible
      expect(screen.getByText(/Find your API token in PagerDuty/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper input label', () => {
      render(<TokenForm {...defaultProps} />);

      const input = screen.getByLabelText(/PagerDuty User API Token/i);
      expect(input).toBeInTheDocument();
    });

    it('should have ApiKeyIcon', () => {
      render(<TokenForm {...defaultProps} apiToken="test" />);

      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should have helper text for input', () => {
      render(<TokenForm {...defaultProps} />);

      expect(screen.getByText(/Find your API token in PagerDuty/i)).toBeInTheDocument();
    });
  });
});
