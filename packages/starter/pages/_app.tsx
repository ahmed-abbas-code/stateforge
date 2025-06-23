import type { AppProps } from 'next/app';
import { AppStateProvider } from '@stateforge/core/context/state/AppStateContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppStateProvider>
      <Component {...pageProps} />
    </AppStateProvider>
  );
}
