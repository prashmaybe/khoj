import { useComponentsDI } from './componentsDI';

export function usePages() {
  return useComponentsDI().pages;
}

