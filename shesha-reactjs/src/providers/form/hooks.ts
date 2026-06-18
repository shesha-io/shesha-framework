import { useCallback, useMemo } from 'react';
import { FormIdentifier, useShaRouting, useSheshaApplication } from '..';
import { IToolboxComponent, IToolboxComponentGroup, IToolboxComponents } from '@/interfaces';
import { getToolboxComponents } from './defaults/toolboxComponents';
import { useFormPersisterIfAvailable } from '../formPersisterProvider';
import { useIsDevMode } from '@/hooks/useIsDevMode';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export const useFormDesignerComponentGroups = (): IToolboxComponentGroup[] => {
  const app = useSheshaApplication();
  const isDevMode = useIsDevMode();
  const formPersister = useFormPersisterIfAvailable();

  const toolboxComponentGroups = useMemo(() => {
    const defaultToolboxComponents = getToolboxComponents(isDevMode, isDefined(formPersister) ? { formId: formPersister.formId, formProps: formPersister.formProps } : undefined);
    const appComponentGroups = app.formDesignerComponentGroups;

    return [...defaultToolboxComponents, ...appComponentGroups];
  }, [formPersister, isDevMode, app.formDesignerComponentGroups]);

  return toolboxComponentGroups;
};

export const toolbarGroupsToComponents = (availableComponents: IToolboxComponentGroup[]): IToolboxComponents => {
  const allComponents: IToolboxComponents = {};
  availableComponents.forEach((group) => {
    group.components.forEach((component) => {
      if (component.type) {
        allComponents[component.type] = component;
      }
    });
  });
  return allComponents;
};

export const useFormDesignerComponents = (): IToolboxComponents => {
  const componentGroups = useFormDesignerComponentGroups();

  const toolboxComponents = useMemo(() => toolbarGroupsToComponents(componentGroups), [componentGroups]);
  return toolboxComponents;
};

export type FormDesignerComponentGetter = (type: string) => IToolboxComponent | undefined;

export const useFormDesignerComponentGetter = (): FormDesignerComponentGetter => {
  const components = useFormDesignerComponents();
  const getter = useCallback((type: string) => {
    return components[type];
  }, [components]);

  return getter;
};

const getDesignerUrl = (designerUrl: string, formId: FormIdentifier): string => {
  return typeof formId === 'string'
    ? `${designerUrl}?docId=${formId}`
    : !isNullOrWhiteSpace(formId.name)
      ? `${designerUrl}?module=${formId.module}&name=${formId.name}`
      : "";
};

export const useFormDesignerUrl = (formId: FormIdentifier | undefined): string => {
  const app = useSheshaApplication();
  const router = useShaRouting();
  if (!formId)
    return "";
  const url = getDesignerUrl(app.routes.configurationStudio, formId);
  return router.prepareUrl(url);
};
