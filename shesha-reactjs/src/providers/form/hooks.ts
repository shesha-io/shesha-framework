import { useCallback, useMemo } from 'react';
import { FormIdentifier, useShaRouting, useSheshaApplication } from '..';
import { IToolboxComponent, IToolboxComponentGroup, IToolboxComponents } from '@/interfaces';
import { getToolboxComponents } from './defaults/toolboxComponents';
import { useFormPersisterIfAvailable } from '../formPersisterProvider';
import { useIsDevMode } from '@/hooks/useIsDevMode';
import { registerComponentTypeAlias, resolveComponentType } from './componentTypeRegistry';

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

          // Auto-register any deprecated type aliases
          if (component.replacesTypes && component.replacesTypes.length > 0) {
            component.replacesTypes.forEach((deprecatedType) => {
              registerComponentTypeAlias(deprecatedType, component.type);
            });
          }
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
    const resolvedType = resolveComponentType(type);
    return components?.[resolvedType];
  }, [components]);

  return getter;
};

const getDesignerUrl = (designerUrl: string, fId: FormIdentifier): string | null => {
  return typeof fId === 'string'
    ? `${designerUrl}?docId=${fId}`
    : Boolean(fId?.name)
      ? `${designerUrl}?module=${fId.module}&name=${fId.name}`
      : null;
};

export const useFormDesignerUrl = (formId: FormIdentifier): string => {
  const app = useSheshaApplication();
  const router = useShaRouting();
  const url = getDesignerUrl(app.routes.configurationStudio, formId);
  return router.prepareUrl(url);
};
