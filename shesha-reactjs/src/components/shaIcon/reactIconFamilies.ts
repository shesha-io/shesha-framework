import * as React from 'react';
import type { ComponentType, CSSProperties } from 'react';
import { IconsManifest } from 'react-icons';

// A minimal shape covering both antd and react-icons components - callers here only ever pass style/className.
export type ReactIconComponent = ComponentType<{ style?: CSSProperties | undefined; className?: string | undefined }>;

// Untyped on purpose: react-icons family modules can't structurally satisfy an index-signature type.
export type FamilyModule = Record<string, unknown>;
const asFamilyModule = (imported: Promise<Record<string, unknown>>): Promise<FamilyModule> => imported;

// One literal import() per family - required (not a templated import(`react-icons/${family}`)) so bundlers can reliably code-split each family.
const FAMILY_IMPORTERS: Record<string, () => Promise<FamilyModule>> = {
  ai: () => asFamilyModule(import('react-icons/ai')),
  bi: () => asFamilyModule(import('react-icons/bi')),
  bs: () => asFamilyModule(import('react-icons/bs')),
  cg: () => asFamilyModule(import('react-icons/cg')),
  ci: () => asFamilyModule(import('react-icons/ci')),
  di: () => asFamilyModule(import('react-icons/di')),
  fa: () => asFamilyModule(import('react-icons/fa')),
  fa6: () => asFamilyModule(import('react-icons/fa6')),
  fc: () => asFamilyModule(import('react-icons/fc')),
  fi: () => asFamilyModule(import('react-icons/fi')),
  gi: () => asFamilyModule(import('react-icons/gi')),
  go: () => asFamilyModule(import('react-icons/go')),
  gr: () => asFamilyModule(import('react-icons/gr')),
  hi: () => asFamilyModule(import('react-icons/hi')),
  hi2: () => asFamilyModule(import('react-icons/hi2')),
  im: () => asFamilyModule(import('react-icons/im')),
  io: () => asFamilyModule(import('react-icons/io')),
  io5: () => asFamilyModule(import('react-icons/io5')),
  lia: () => asFamilyModule(import('react-icons/lia')),
  lu: () => asFamilyModule(import('react-icons/lu')),
  md: () => asFamilyModule(import('react-icons/md')),
  pi: () => asFamilyModule(import('react-icons/pi')),
  ri: () => asFamilyModule(import('react-icons/ri')),
  rx: () => asFamilyModule(import('react-icons/rx')),
  si: () => asFamilyModule(import('react-icons/si')),
  sl: () => asFamilyModule(import('react-icons/sl')),
  tb: () => asFamilyModule(import('react-icons/tb')),
  tfi: () => asFamilyModule(import('react-icons/tfi')),
  ti: () => asFamilyModule(import('react-icons/ti')),
  vsc: () => asFamilyModule(import('react-icons/vsc')),
  wi: () => asFamilyModule(import('react-icons/wi')),
};

export interface IReactIconFamily {
  key: string;
  label: string;
}

export const REACT_ICON_FAMILIES: IReactIconFamily[] = IconsManifest
  .filter((m) => FAMILY_IMPORTERS[m.id] !== undefined)
  .map((m) => ({ key: m.id, label: m.name }));

// Cached per family so re-selecting it in the picker, or rendering many icons from it elsewhere, only imports once.
// A rejected import (e.g. transient network failure) is evicted so a later call retries instead of replaying the same rejection.
const familyModuleCache = new Map<string, Promise<FamilyModule>>();
export function loadFamilyModule(family: string): Promise<FamilyModule> {
  let cached = familyModuleCache.get(family);
  if (!cached) {
    cached = (FAMILY_IMPORTERS[family] ?? (() => Promise.resolve({} as FamilyModule)))().catch((error: unknown) => {
      familyModuleCache.delete(family);
      throw error;
    });
    familyModuleCache.set(family, cached);
  }
  return cached;
}

// Cached per "family:exportName" so ShaIcon reuses the same LazyExoticComponent across mounts (e.g. the same icon rendered per table row) - React resolves a given lazy() instance's payload once, so repeat mounts render synchronously afterwards.
const lazyIconCache = new Map<string, React.LazyExoticComponent<ReactIconComponent>>();
export function getReactIconComponent(family: string, exportName: string): React.LazyExoticComponent<ReactIconComponent> {
  const cacheKey = `${family}:${exportName}`;
  let Lazy = lazyIconCache.get(cacheKey);
  if (!Lazy) {
    Lazy = React.lazy(async () => {
      const mod = await loadFamilyModule(family);
      return { default: (mod[exportName] as ReactIconComponent | undefined) ?? (() => null) };
    });
    lazyIconCache.set(cacheKey, Lazy);
  }
  return Lazy;
}

export function getFamilyIconComponent(mod: FamilyModule, exportName: string): ReactIconComponent | undefined {
  return mod[exportName] as ReactIconComponent | undefined;
}

// Fixed marker identifying a react-icons value - distinct from the 'ri' *family code* (Remix Icon) that can appear as segment 2, e.g. "ri:ri:RiHome2Line" is a valid Remix Icon value (marker:family:exportName).
const REACT_ICON_MARKER = 'ri';

export interface IParsedReactIconValue {
  family: string;
  exportName: string;
}

export function parseReactIconValue(value: string | null | undefined): IParsedReactIconValue | null {
  if (!value) return null;
  const parts = value.split(':');
  if (parts.length !== 3 || parts[0] !== REACT_ICON_MARKER) return null;
  const [, family, exportName] = parts;
  return family && exportName ? { family, exportName } : null;
}

export function buildReactIconValue(family: string, exportName: string): string {
  return `${REACT_ICON_MARKER}:${family}:${exportName}`;
}
