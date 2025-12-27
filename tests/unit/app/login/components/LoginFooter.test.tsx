import { render, screen } from '@testing-library/react';
import { LoginFooter } from '@/app/login/components/LoginFooter';
import { ROUTES } from '@/lib/constants';

describe('LoginFooter', () => {
  describe('Rendering', () => {
    it('should render help text', () => {
      render(<LoginFooter />);

      expect(screen.getByText(/Need help\?/i)).toBeInTheDocument();
    });

    it('should render documentation link', () => {
      render(<LoginFooter />);

      const link = screen.getByRole('link', { name: /documentation/i });
      expect(link).toBeInTheDocument();
    });

    it('should use correct URL from constants', () => {
      render(<LoginFooter />);

      const link = screen.getByRole('link', { name: /documentation/i });
      expect(link).toHaveAttribute('href', ROUTES.DOCUMENTATION);
    });

    it('should open link in new tab', () => {
      render(<LoginFooter />);

      const link = screen.getByRole('link', { name: /documentation/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Content', () => {
    it('should mention contacting administrator', () => {
      render(<LoginFooter />);

      expect(screen.getByText(/Contact your administrator/i)).toBeInTheDocument();
    });

    it('should display complete help message', () => {
      const { container } = render(<LoginFooter />);

      const footerText = container.textContent;
      expect(footerText).toContain('Need help?');
      expect(footerText).toContain('Contact your administrator');
      expect(footerText).toContain('documentation');
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive link text', () => {
      render(<LoginFooter />);

      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName(/documentation/i);
    });

    it('should have proper rel attribute for security', () => {
      render(<LoginFooter />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Styling', () => {
    it('should render as caption variant', () => {
      const { container } = render(<LoginFooter />);

      const caption = container.querySelector('.MuiTypography-caption');
      expect(caption).toBeInTheDocument();
    });
  });
});
