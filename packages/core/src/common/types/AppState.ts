export interface AppSharedState {
  hydrated: boolean;
  lastUpdated: string;
  userRole?: 'admin' | 'user' | 'guest';
  theme?: 'light' | 'dark';
  darkMode?: boolean;
}

export interface AppStateContextType {
  appSharedState: AppSharedState;
  setAppSharedState: React.Dispatch<React.SetStateAction<AppSharedState>>;
}
