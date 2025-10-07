import { useCallback, useMemo } from 'react';
import { FormIdentifier, useSheshaApplication } from '..';
import { IToolboxComponent, IToolboxComponentGroup, IToolboxComponents } from '@/interfaces';
import { getToolboxComponents } from './defaults/toolboxComponents';
import { useFormPersisterIfAvailable } from '../formPersisterProvider';
import { useIsDevMode } from '@/hooks/useIsDevMode';

export const useFormDesignerComponentGroups = (): IToolboxComponentGroup[] => {
  const app = useSheshaApplication(false);
  const isDevMode = useIsDevMode();
  const formPersister = useFormPersisterIfAvailable();

  const { formId, formProps } = formPersister || {};

  const toolboxComponentGroups = useMemo(() => {
    const defaultToolboxComponents = getToolboxComponents(isDevMode, { formId, formProps });
    const appComponentGroups = app?.formDesignerComponentGroups;

    return [...(defaultToolboxComponents || []), ...(appComponentGroups || [])];
  }, [formId, formProps, isDevMode, app?.formDesignerComponentGroups]);

  return toolboxComponentGroups;
};

export const toolbarGroupsToComponents = (availableComponents: IToolboxComponentGroup[]): IToolboxComponents => {
  const allComponents: IToolboxComponents = {};
  if (availableComponents) {
    availableComponents.forEach((group) => {
      group.components.forEach((component) => {
        if (component?.type) {
          allComponents[component.type] = component;
        }
      });
    });
  }
  return allComponents;
};

export const useFormDesignerComponents = (): IToolboxComponents => {
  const componentGroups = useFormDesignerComponentGroups();

  const toolboxComponents = useMemo(() => toolbarGroupsToComponents(componentGroups), [componentGroups]);
  return toolboxComponents;
};

export type FormDesignerComponentGetter = (type: string) => IToolboxComponent;

export const useFormDesignerComponentGetter = (): FormDesignerComponentGetter => {
  const components = useFormDesignerComponents();
  const getter = useCallback((type: string) => {
    return components?.[type];
  }, [components]);

  return getter;
};

const getDesignerUrl = (designerUrl: string, fId: FormIdentifier): string | null => {
  return typeof fId === 'string'
    ? `${designerUrl}?id=${fId}`
    : Boolean(fId?.name)
      ? `${designerUrl}?module=${fId.module}&name=${fId.name}`
      : null;
};

export const useFormDesignerUrl = (formId: FormIdentifier): string => {
  const app = useSheshaApplication();
  return getDesignerUrl(app.routes.formsDesigner, formId);
};
