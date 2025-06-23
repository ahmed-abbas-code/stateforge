import { createContext, useContext, useState, ReactNode } from 'react';

export interface AppSharedState {
  hydrated: boolean;
  [key: string]: any;
}

interface AppStateContextType {
  appSharedState: AppSharedState;
  setAppSharedState: React.Dispatch<React.SetStateAction<AppSharedState>>;
}

const defaultState: AppSharedState = {
  hydrated: false,
};

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appSharedState, setAppSharedState] = useState<AppSharedState>(defaultState);

  return (
    <AppStateContext.Provider value={{ appSharedState, setAppSharedState }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
