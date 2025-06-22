import { helloFromCore } from '@stateforge/core';

export default function Home() {
  return (
    <div>
      <h1>Welcome to StateForge Starter</h1>
      <p>{helloFromCore()}</p>
    </div>
  );
}
