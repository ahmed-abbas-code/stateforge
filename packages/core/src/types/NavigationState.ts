export interface NavigationState {
  [key: string]: any;
}

export interface NavigationStateContextType {
  navState: NavigationState;
  setNavState: React.Dispatch<React.SetStateAction<NavigationState>>;
}
