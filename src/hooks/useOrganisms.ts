import { useComponentsDI } from './componentsDI';

export function useOrganisms() {
  return useComponentsDI().organisms;
}

