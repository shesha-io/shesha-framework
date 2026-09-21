import { IToolboxComponent } from '@/interfaces/formDesigner';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { isNullOrWhiteSpace } from '@/utils/nullables';

/** Sample entity used to give data-driven components something to render in the preview. */
const DUMMY_ENTITY_TYPE = { name: 'DummyTable', module: 'Shesha' };

/**
 * Charts refuse to render and show "Chart control properties not set correctly!" until they have an
 * entity plus an axis and value property. DummyTable's country/population make a readable sample:
 * a categorical axis and a numeric value, aggregated so repeated countries collapse into one bar.
 */
const chartPreviewExtras: Record<string, unknown> = {
  dataMode: 'entityType',
  entityType: DUMMY_ENTITY_TYPE,
  simpleOrPivot: 'simple',
  axisProperty: 'country',
  valueProperty: 'population',
  aggregationMethod: 'sum',
};

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
    entityType: DUMMY_ENTITY_TYPE,
    displayPropName: 'city',
    fields: ['city'],
  },
  barChart: chartPreviewExtras,
  lineChart: chartPreviewExtras,
  pieChart: chartPreviewExtras,
  polarAreaChart: chartPreviewExtras,
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
