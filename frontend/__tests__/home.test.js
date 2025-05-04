import { render, screen } from '@testing-library/react';
import Home from '../src/app/page';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the "Get Started" button', () => {
    render(<Home />);
    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
  });

  it('renders the feature sections', () => {
    render(<Home />);
    const featureHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(featureHeadings.length).toBeGreaterThan(0);
  });
});