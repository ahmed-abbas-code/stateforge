export interface NavigationState {
  [key: string]: unknown;
}

export interface NavigationStateContextType {
  navState: NavigationState;
  setNavState: React.Dispatch<React.SetStateAction<NavigationState>>;
}
