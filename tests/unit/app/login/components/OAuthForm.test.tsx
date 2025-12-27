import { render, screen, fireEvent } from '@testing-library/react';
import { OAuthForm } from '@/app/login/components/OAuthForm';
import { PERMISSIONS } from '@/app/login/constants';

describe('OAuthForm', () => {
  const mockOnSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sign-in button', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      const button = screen.getByRole('button', { name: /Sign in with PagerDuty/i });
      expect(button).toBeInTheDocument();
    });

    it('should render disclaimer text', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      expect(
        screen.getByText(
          /By signing in, you authorize CalOohPay to access your PagerDuty schedules/i
        )
      ).toBeInTheDocument();
    });

    it('should render permissions section', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      expect(screen.getByText('Required Permissions:')).toBeInTheDocument();
    });

    it('should render all permissions from constants', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      PERMISSIONS.forEach((permission) => {
        expect(screen.getByText(new RegExp(permission, 'i'))).toBeInTheDocument();
      });
    });
  });

  describe('Button behavior', () => {
    it('should call onSignIn when button is clicked', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      const button = screen.getByRole('button', { name: /Sign in with PagerDuty/i });
      fireEvent.click(button);

      expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when loading', () => {
      render(<OAuthForm isLoading={true} onSignIn={mockOnSignIn} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when not loading', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
    });

    it('should show loading text when loading', () => {
      render(<OAuthForm isLoading={true} onSignIn={mockOnSignIn} />);

      expect(screen.getByText('Connecting to PagerDuty...')).toBeInTheDocument();
    });

    it('should show default text when not loading', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      expect(screen.getByText('Sign in with PagerDuty')).toBeInTheDocument();
    });

    it('should not call onSignIn when disabled', () => {
      render(<OAuthForm isLoading={true} onSignIn={mockOnSignIn} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have LoginIcon', () => {
      render(<OAuthForm isLoading={false} onSignIn={mockOnSignIn} />);

      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
