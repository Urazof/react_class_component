import { vi } from 'vitest';

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const useRouter = () => mockRouter;
export const usePathname = () => '/';
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];
export const redirect = vi.fn();
export const permanentRedirect = vi.fn();
export const notFound = vi.fn();
export const ReadonlyURLSearchParams = URLSearchParams;
