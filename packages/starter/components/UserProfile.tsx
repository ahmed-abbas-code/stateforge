import { useAuth } from '@stateforge/core';

export const UserProfile = () => {
  const { user, logout } = useAuth();

  if (!user) return <p>Not logged in</p>;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">User Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button onClick={logout} className="mt-2 bg-red-600 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
};
