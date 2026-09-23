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

/** One labelled rendering of a component in the preview. */
export interface IPreviewVariant {
  /** Caption shown above this rendering. */
  label: string;
  /** Model properties that put the component into this state. */
  model: Record<string, unknown>;
}

/**
 * Components whose appearance differs by mode, keyed by component type.
 *
 * A single rendering only shows one of these, so a theme change that affects, say, a dropdown's
 * tag styling is invisible while the preview happens to be in plain-text mode. Listing the modes
 * renders each one, so every style the component exposes can be judged at a glance.
 *
 * Property names here are the component's own - `mode`/`displayStyle` on a dropdown,
 * `displayStyle` on the file list - so they drive the same code paths as a real form.
 */
const previewVariantsByType: Record<string, IPreviewVariant[]> = {
  dropdown: [
    { label: 'Single', model: { mode: 'single', displayStyle: 'text' } },
    { label: 'Multiple', model: { mode: 'multiple', displayStyle: 'text' } },
    { label: 'Tags', model: { mode: 'multiple', displayStyle: 'tags' } },
    { label: 'Free-text tags', model: { mode: 'tags', displayStyle: 'tags' } },
  ],
  attachmentsEditor: [
    { label: 'File name', model: { displayStyle: 'text' } },
    { label: 'Thumbnail (small)', model: { displayStyle: 'thumbnailSmall' } },
    { label: 'Thumbnail (medium)', model: { displayStyle: 'thumbnailMedium' } },
    { label: 'Thumbnail (large)', model: { displayStyle: 'thumbnailLarge' } },
    { label: 'Drag & drop', model: { displayStyle: 'text', isDragger: true } },
  ],
};

/**
 * The variants to render for a component type. Components with no entry preview as a single
 * unlabelled instance, which is the behaviour for everything that has only one appearance.
 */
export const getPreviewVariants = (componentType: string | undefined): IPreviewVariant[] | undefined =>
  isNullOrWhiteSpace(componentType) ? undefined : previewVariantsByType[componentType];

/**
 * Model used to render the preview of a component on the Component Defaults panel: the component's
 * own `previewConfiguration` when it declares one, a generic model otherwise, with the preview-only
 * extras for its type applied on top.
 */
export const getPreviewComponentModel = (
  componentDefinition: IToolboxComponent,
  variant?: IPreviewVariant | undefined,
): IConfigurableFormComponent => {
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
  const model = isNullOrWhiteSpace(componentType) || !extras
    ? baseModel
    : { ...baseModel, ...extras };

  if (!variant)
    return model;

  // Each variant needs its own id and propertyName, otherwise the renderings share form state and
  // a value selected in one appears in all of them. The variant's own properties come last so it
  // can override anything the base model or the extras set.
  const variantKey = variant.label.replace(/\W+/g, '-').toLowerCase();
  return {
    ...model,
    ...variant.model,
    id: `${model.id}-${variantKey}`,
    propertyName: `${model.propertyName}-${variantKey}`,
    // The caption above each rendering names the variant, so an inner label just repeats it.
    label: model.label,
  } as IConfigurableFormComponent;
};
