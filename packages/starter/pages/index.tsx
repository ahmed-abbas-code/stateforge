import { useAppState, usePersistedFramework } from '@stateforge/core';
import type { AppSharedState } from '@stateforge/core';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const { appSharedState, setAppSharedState } = useAppState();

  const [clientValue, setClientValue] = usePersistedFramework<string>({
    key: 'client_input',
    strategy: 'localStorage',
    defaultValue: '',
  });

  const [serverValue, setServerValue] = usePersistedFramework<string>({
    key: 'server_input',
    strategy: 'restApi',
    defaultValue: '',
  });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAppSharedState((prev: AppSharedState) => ({
      ...prev,
      hydrated: true,
      lastUpdated: new Date().toISOString(),
    }));
    setLoaded(true);
  }, [setAppSharedState]);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>StateForge Sample App</h1>

      <section style={{ marginTop: '2rem' }}>
        <h2>Client-side State (Persisted)</h2>
        <input
          type="text"
          value={clientValue}
          onChange={(e) => setClientValue(e.target.value)}
          placeholder="Enter client-only data"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Server-side State (Persisted via API)</h2>
        <input
          type="text"
          value={serverValue}
          onChange={(e) => setServerValue(e.target.value)}
          placeholder="Enter server-synced data"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Shared Application State</h2>
        <pre style={{ backgroundColor: '#f4f4f4', padding: '1rem' }}>
          {JSON.stringify(appSharedState, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <p>Status: <strong>{loaded ? 'Loaded' : 'Loading...'}</strong></p>
      </section>
    </main>
  );
}
