

import { useAuth, withAuthProtection } from "packages/core/dist/client-only";

function DashboardPage() {
  const { user, loading, error } = useAuth();

  if (loading) return <p>Loading authentication...</p>;
  if (error) return <p>Error: {error.message || 'Failed to load user'}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email ?? 'Unknown user'}</p>
    </div>
  );
}

export default withAuthProtection(DashboardPage);
