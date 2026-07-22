import { useMemo } from 'react';
import { FormBuilderFactory } from './interfaces';
import { makeFormBuliderFactory } from './implementation';
import { FormMarkup, SettingsFormMarkupFactory } from '@/interfaces';

export const useFormBuilderFactory = (): FormBuilderFactory => {
  const factory = useMemo<FormBuilderFactory>(() => {
    return makeFormBuliderFactory();
  }, []);

  return factory;
};

export const useFormViaFactory = (creator: SettingsFormMarkupFactory): FormMarkup => {
  const builderFactory = useFormBuilderFactory();
  return useMemo(() => {
    return creator({ fbf: builderFactory });
  }, [creator, builderFactory]);
};
