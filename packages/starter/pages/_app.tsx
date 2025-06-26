import type { AppProps } from 'next/app';
import '../src/styles/globals.css';

import {
  AppStateProvider,
  NavigationStateProvider,
  AuthProvider,
} from '@stateforge/core';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppStateProvider>
        <NavigationStateProvider>
          <Component {...pageProps} />
        </NavigationStateProvider>
      </AppStateProvider>
    </AuthProvider>
  );
}
