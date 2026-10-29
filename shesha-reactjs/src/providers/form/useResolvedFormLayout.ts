import { useMemo } from 'react';
import { useThemeState } from '@/providers/theme';
import { IFormSettingsCommon, IResolvedFormLayout, resolveFormLayout } from './models';

/** Effective layout of a form, with the theme's Form Span settings filling in what the form did not set (see `resolveFormLayout`). */
export const useResolvedFormLayout = (settings: Partial<IFormSettingsCommon> | undefined): IResolvedFormLayout => {
  const { theme } = useThemeState();
  return useMemo(() => resolveFormLayout(settings, theme), [settings, theme]);
};
