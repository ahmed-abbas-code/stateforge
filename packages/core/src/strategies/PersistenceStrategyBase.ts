export type PersistenceStrategy = {
  save: (key: string, value: any) => void;
  load: (key: string) => any;
};
