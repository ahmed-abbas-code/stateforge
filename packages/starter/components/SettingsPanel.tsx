import { useAppState } from '@stateforge/core';

export const SettingsPanel = () => {
  const { state, setState } = useAppState();

  const toggleDarkMode = () => {
    setState({ ...state, darkMode: !state.darkMode });
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold mb-2">App Settings</h2>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={state.darkMode}
          onChange={toggleDarkMode}
        />
        <span>Enable Dark Mode</span>
      </label>
    </div>
  );
};
