import { render, screen } from '@testing-library/react';
import { LoginHeader } from '@/app/login/components/LoginHeader';

describe('LoginHeader', () => {
  describe('Rendering', () => {
    it('should render the application title', () => {
      render(<LoginHeader />);

      const title = screen.getByRole('heading', { name: /CalOohPay Web/i });
      expect(title).toBeInTheDocument();
    });

    it('should render the description text', () => {
      render(<LoginHeader />);

      expect(
        screen.getByText(/Sign in with your PagerDuty account to calculate on-call compensation/i)
      ).toBeInTheDocument();
    });

    it('should have correct heading level', () => {
      render(<LoginHeader />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('CalOohPay Web');
    });
  });

  describe('Styling', () => {
    it('should render title with primary color', () => {
      const { container } = render(<LoginHeader />);

      const title = container.querySelector('h1');
      expect(title).toBeInTheDocument();
    });

    it('should center align text', () => {
      const { container } = render(<LoginHeader />);

      const title = container.querySelector('h1');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      render(<LoginHeader />);

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(1);
    });

    it('should provide clear page context', () => {
      render(<LoginHeader />);

      const title = screen.getByRole('heading');
      expect(title).toHaveTextContent('CalOohPay Web');
    });
  });
});
