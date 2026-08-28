import { IToolboxComponent } from '@/interfaces/formDesigner';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { isNullOrWhiteSpace } from '@/utils/nullables';

/**
 * Preview-only model properties, keyed by component type.
 *
 * Some components render nothing recognisable without a data source: an autocomplete with no entity
 * behind it is an empty box that never opens a dropdown, so there is nothing to judge the default
 * appearance against. These entries point such a component at a sample entity for the preview only —
 * they are not part of the component defaults stored on the theme.
 */
const previewModelExtrasByType: Record<string, Record<string, unknown>> = {
  autocomplete: {
    entityType: { name: 'DummyTable', module: 'Shesha' },
    displayPropName: 'city',
    fields: ['city'],
  },
};

/**
 * Extra preview-only model properties for the given component type, `undefined` when it needs none.
 */
export const getPreviewModelExtras = (componentType: string | undefined): Record<string, unknown> | undefined =>
  isNullOrWhiteSpace(componentType) ? undefined : previewModelExtrasByType[componentType];

/**
 * Model used to render the preview of a component on the Component Defaults panel: the component's
 * own `previewConfiguration` when it declares one, a generic model otherwise, with the preview-only
 * extras for its type applied on top.
 */
export const getPreviewComponentModel = (componentDefinition: IToolboxComponent): IConfigurableFormComponent => {
  const componentType = componentDefinition.type;
  const baseModel: IConfigurableFormComponent = componentDefinition.previewConfiguration ?? {
    type: componentType,
    id: componentType,
    propertyName: `${componentType}Appearance`,
    label: `${componentDefinition.name} Label`,
    parentId: 'root',
    hidden: false,
    version: 'latest',
  };

  const extras = getPreviewModelExtras(componentType);
  return isNullOrWhiteSpace(componentType) || !extras
    ? baseModel
    : { ...baseModel, ...extras };
};
