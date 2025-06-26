import { useAppState, usePersistedFramework } from '@stateforge/core';
import type { AppSharedState } from '@stateforge/core';

import { useEffect, useState } from 'react';

// This is just a fake async fetch to simulate server persistence.
// Replace with real API hook if needed.
async function fetchServerValue(): Promise<string> {
  const res = await fetch('/api/server-state');
  const json = await res.json();
  return json.value || '';
}

async function updateServerValue(value: string): Promise<void> {
  await fetch('/api/server-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
}

export default function HomePage() {
  const { appSharedState, setAppSharedState } = useAppState();

  const [clientValue, setClientValue] = usePersistedFramework<string>({
    key: 'client_input',
    strategy: 'localStorage',
    defaultValue: '',
  });

  const [serverValue, setServerValue] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Hydrate app state
    setAppSharedState((prev: AppSharedState) => ({
      ...prev,
      hydrated: true,
      lastUpdated: new Date().toISOString(),
    }));

    // Load server value
    fetchServerValue().then(setServerValue).finally(() => setLoaded(true));
  }, [setAppSharedState]);

  const handleServerChange = (val: string) => {
    setServerValue(val);
    updateServerValue(val).catch((err) =>
      console.error('[StateForge] Failed to save server state:', err)
    );
  };

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
          onChange={(e) => handleServerChange(e.target.value)}
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
