import { useWindowDimensions } from 'react-native';

const DESKTOP_BREAKPOINT = 768;

export type Breakpoint = 'mobile' | 'desktop';

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return width >= DESKTOP_BREAKPOINT ? 'desktop' : 'mobile';
}
