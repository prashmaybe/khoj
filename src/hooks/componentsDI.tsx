import React, { createContext, useContext, useMemo } from 'react';
import type { ComponentType } from 'react';

import * as atoms from '../components/atoms';
import * as molecules from '../components/molecules';
import * as organisms from '../components/organisms';
import * as pages from '../components/pages';

export type Atoms = typeof atoms;
export type Molecules = typeof molecules;
export type Organisms = typeof organisms;
export type Pages = typeof pages;

export type ComponentsDI = {
  atoms: Atoms;
  molecules: Molecules;
  organisms: Organisms;
  pages: Pages;
};

const defaultDI: ComponentsDI = {
  atoms,
  molecules,
  organisms,
  pages,
};

const ComponentsContext = createContext<ComponentsDI>(defaultDI);

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K];
};

function mergeDI(base: ComponentsDI, override?: DeepPartial<ComponentsDI>): ComponentsDI {
  if (!override) return base;
  return {
    atoms: { ...base.atoms, ...(override.atoms as any) },
    molecules: { ...base.molecules, ...(override.molecules as any) },
    organisms: { ...base.organisms, ...(override.organisms as any) },
    pages: { ...base.pages, ...(override.pages as any) },
  };
}

export type ComponentsProviderProps = {
  children: React.ReactNode;
  value?: DeepPartial<ComponentsDI>;
};

export function ComponentsProvider({ children, value }: ComponentsProviderProps) {
  const resolved = useMemo(() => mergeDI(defaultDI, value), [value]);
  return <ComponentsContext.Provider value={resolved}>{children}</ComponentsContext.Provider>;
}

export function useComponentsDI() {
  return useContext(ComponentsContext);
}

// Helper type for overriding a single component if needed.
export type OverrideComponent<TProps = any> = ComponentType<TProps>;

