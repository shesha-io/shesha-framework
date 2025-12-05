import { useCallback, useMemo } from 'react';
import { FormIdentifier, useShaRouting, useSheshaApplication } from '..';
import { IToolboxComponent, IToolboxComponentGroup, IToolboxComponents } from '@/interfaces';
import { getToolboxComponents } from './defaults/toolboxComponents';
import { useLocalStorage } from '@/hooks';
import { useFormPersister } from '../formPersisterProvider';

export const useFormDesignerComponentGroups = () => {
  const app = useSheshaApplication(false);
  const [isDevmode] = useLocalStorage('application.isDevMode', false);
  const formPersister = useFormPersister(false);

  const { formId, formProps } = formPersister || {};

  const toolboxComponentGroups = useMemo(() => {
    const defaultToolboxComponents = getToolboxComponents(isDevmode, { formId, formProps });
    const appComponentGroups = app?.formDesignerComponentGroups;

    return [...(defaultToolboxComponents || []), ...(appComponentGroups || [])];
  }, [formId, formProps, isDevmode, app?.formDesignerComponentGroups]);

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

const getDesignerUrl = (designerUrl: string, fId: FormIdentifier) => {
  return typeof fId === 'string'
    ? `${designerUrl}?id=${fId}`
    : Boolean(fId?.name)
      ? `${designerUrl}?module=${fId.module}&name=${fId.name}`
      : null;
};

export const useFormDesignerUrl = (formId: FormIdentifier) => {
  const app = useSheshaApplication();
  const router = useShaRouting();
  const url = getDesignerUrl(app.routes.formsDesigner, formId);
  return router.prepareUrl(url);
};
