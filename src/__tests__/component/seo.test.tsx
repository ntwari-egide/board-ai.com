import { render, waitFor } from '@testing-library/react';
import mockRouter from 'next-router-mock';

import Seo from '@/component/seo';

jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/head', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);

describe('Seo component', () => {
  it('renders favicons with versioned hrefs', async () => {
    mockRouter.push('/sample');

    const { container } = render(<Seo templateTitle='Sample Page' />);

    await waitFor(() => {
      const icon32 = container.querySelector(
        "link[href*='favicon-32x32.png']",
      ) as HTMLLinkElement | null;
      expect(icon32).not.toBeNull();
      expect(icon32?.href).toContain('/favicon/favicon-32x32.png');
      expect(icon32?.href).toMatch(/v2/);
    });

    await waitFor(() => {
      const manifest = container.querySelector(
        "link[rel='manifest']",
      ) as HTMLLinkElement | null;
      expect(manifest).not.toBeNull();
      expect(manifest?.href).toContain('/favicon/site.webmanifest');
      expect(manifest?.href).toMatch(/v2/);
    });
  });

  it('applies canonical URL from router path', async () => {
    mockRouter.push('/sample');

    const { container } = render(<Seo templateTitle='Canonical Check' />);

    await waitFor(() => {
      const canonicalLink = container.querySelector(
        "link[rel='canonical']",
      ) as HTMLLinkElement | null;
      expect(canonicalLink).not.toBeNull();
      expect(canonicalLink?.href).toContain('/sample');
    });
  });
});
