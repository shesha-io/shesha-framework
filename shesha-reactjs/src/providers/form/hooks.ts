import { useMemo } from 'react';
import { FormIdentifier, useSheshaApplication } from '..';
import { IToolboxComponentGroup, IToolboxComponents } from '@/interfaces';
import getDefaultToolboxComponents from './defaults/toolboxComponents';
import { useLocalStorage } from '@/hooks';

export const useFormDesignerComponentGroups = () => {
  const app = useSheshaApplication(false);
  const [ isDevmode ] = useLocalStorage('application.isDevMode', false);
  const defaultToolboxComponents = getDefaultToolboxComponents(isDevmode);
  const appComponentGroups = app?.toolboxComponentGroups;

  const toolboxComponentGroups = useMemo(() => {
    return [...(defaultToolboxComponents || []), ...(appComponentGroups || [])];
  }, [defaultToolboxComponents, appComponentGroups]);
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

const getDesignerUrl = (designerUrl: string, fId: FormIdentifier) => {
  return typeof fId === 'string'
    ? `${designerUrl}?id=${fId}`
    : Boolean(fId?.name)
      ? `${designerUrl}?module=${fId.module}&name=${fId.name}`
      : null;
};

export const useFormDesignerUrl = (formId: FormIdentifier) => {
  const app = useSheshaApplication();
  return getDesignerUrl(app.routes.formsDesigner, formId);
};