import { useMemo } from 'react';
import { FormBuilderFactory } from './interfaces';
import { makeFormBuliderFactory } from './implementation';
import { FormMarkup, SettingsFormMarkupFactory } from '@/interfaces';
import { useAllFormDesignerComponentGroups } from '@/providers/form/hooks';
import { componentGroupsToComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';

export const useFormBuilderFactory = (): FormBuilderFactory => {
  const componentGroups = useAllFormDesignerComponentGroups();
  const factory = useMemo<FormBuilderFactory>(() => {
    const components = componentGroupsToComponentDefinitions(componentGroups);
    return makeFormBuliderFactory(components);
  }, [componentGroups]);

  return factory;
};

export const useFormViaFactory = (creator: SettingsFormMarkupFactory): FormMarkup => {
  const builderFactory = useFormBuilderFactory();
  return useMemo(() => {
    return creator({ fbf: builderFactory });
  }, [creator, builderFactory]);
};
