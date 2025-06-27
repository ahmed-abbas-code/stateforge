import type { AppProps } from 'next/app';
import '../src/styles/globals.css';

// ✅ Patch env before anything from @stateforge/core is loaded
import '../src/lib/patchEnvForDryRun';

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
