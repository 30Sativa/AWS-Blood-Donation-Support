import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root Providers wrapper
 * Add your providers here when needed:
 * - Redux Provider + PersistGate
 * - ConfigProvider (Ant Design, etc.)
 * - ModalProvider
 * - ThemeProvider
 * - etc.
 */
export default function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}

