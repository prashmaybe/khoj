import { useComponentsDI } from './componentsDI';

export function useAtoms() {
  return useComponentsDI().atoms;
}

