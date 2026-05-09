import { useComponentsDI } from './componentsDI';

export function useMolecules() {
  return useComponentsDI().molecules;
}

