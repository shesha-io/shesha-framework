import { IFormValidationErrors, IToolboxComponent } from '@/interfaces/formDesigner';
import { getEmptyFlatMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { upgradeComponent } from '@/providers/form/utils';
import { isNullOrWhiteSpace } from '@/utils/nullables';

/** Sample entity used to give data-driven components something to render in the preview. */
const DUMMY_ENTITY_TYPE = { name: 'DummyTable', module: 'Shesha' };

/** A reference list seeded in every Shesha install (Male = 1, Female = 2, Not disclosed = 3). */
const SAMPLE_REFERENCE_LIST = { module: 'Shesha', name: 'Shesha.Core.Gender' };

/** A small landscape placeholder, inlined as an SVG data URI. */
const SAMPLE_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150" viewBox="0 0 240 150">' +
  '<rect width="240" height="150" fill="#dbe7f3"/>' +
  '<circle cx="180" cy="42" r="16" fill="#f6c453"/>' +
  '<path d="M0 150 L70 70 L120 120 L160 85 L240 150 Z" fill="#7aa5cf"/>' +
  '</svg>',
)}`;

/**
 * Components previewed exactly as the designer creates them when dropped: `initModel`, then their
 * migrator run as for a new component, which is where these get their defaults. A chart's type,
 * title, legend and default data source all come from its migrator, and in the preview it draws the
 * same sample data as on the designer canvas (see `ComponentPreviewContext`).
 */
const PREVIEW_AS_NEW_COMPONENT: ReadonlySet<string> = new Set(['barChart', 'lineChart', 'pieChart', 'polarAreaChart']);

/** The model the designer gives `definition` when it is dropped onto a form. */
const createNewComponentModel = (definition: IToolboxComponent, model: IConfigurableFormComponent): IConfigurableFormComponent => {
  // No version, so every migration runs, as for a freshly dropped component.
  const { version: _version, ...unversioned } = model;
  const initialised = definition.initModel ? definition.initModel(unversioned) : unversioned;
  return upgradeComponent(initialised, definition, undefined, getEmptyFlatMarkup(), true);
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
  // An embedded picture, so the preview never fetches anything over the network.
  image: { dataSource: 'base64', base64: SAMPLE_IMAGE },
  refListStatus: { referenceListId: SAMPLE_REFERENCE_LIST },
};

/**
 * Preview-only field values, keyed by component type, for components that display their value and
 * draw nothing without one - a reference list status has no tag to show until it has an item.
 */
const previewValueByType: Record<string, unknown> = {
  refListStatus: 1,
};

/** Sample field value for the given component type, `undefined` when it renders without one. */
export const getPreviewValue = (componentType: string | undefined): unknown =>
  isNullOrWhiteSpace(componentType) ? undefined : previewValueByType[componentType];

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
  /**
   * Validation errors to put on this rendering's form. Some states are driven by the form rather
   * than the component's own model - Validation Errors draws nothing until the form has errors.
   */
  formErrors?: IFormValidationErrors | undefined;
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
    { label: 'Tag', model: { mode: 'single', displayStyle: 'tags' } },
    { label: 'Multiple tags', model: { mode: 'multiple', displayStyle: 'tags' } },
  ],
  attachmentsEditor: [
    { label: 'File name', model: { displayStyle: 'text' } },
    { label: 'Thumbnail (small)', model: { displayStyle: 'thumbnailSmall' } },
    { label: 'Thumbnail (medium)', model: { displayStyle: 'thumbnailMedium' } },
    { label: 'Thumbnail (large)', model: { displayStyle: 'thumbnailLarge' } },
    // Only mode whose dimensions are editable — the presets above size themselves.
    { label: 'Thumbnail (custom)', model: { displayStyle: 'thumbnailCustom' } },
    { label: 'Drag & drop', model: { displayStyle: 'text', isDragger: true } },
  ],
  fileUpload: [
    { label: 'File name', model: { displayStyle: 'text' } },
    { label: 'Thumbnail (small)', model: { displayStyle: 'thumbnailSmall' } },
    { label: 'Thumbnail (medium)', model: { displayStyle: 'thumbnailMedium' } },
    { label: 'Thumbnail (large)', model: { displayStyle: 'thumbnailLarge' } },
    // Only mode whose dimensions are editable — the presets above size themselves.
    { label: 'Thumbnail (custom)', model: { displayStyle: 'thumbnailCustom' } },
    { label: 'Drag & drop', model: { displayStyle: 'text', isDragger: true } },
  ],
  // A sample percentage so each shape is drawn part-filled rather than empty.
  progress: [
    { label: 'Line', model: { progressType: 'line', percent: 60 } },
    { label: 'Circle', model: { progressType: 'circle', percent: 60 } },
    { label: 'Dashboard', model: { progressType: 'dashboard', percent: 60 } },
  ],
  // One per layout the alert renders: a list of field errors, a message with details, a bare message.
  validationErrors: [
    {
      label: 'Field errors',
      model: {},
      formErrors: {
        message: 'Please correct the errors and try again:',
        validationErrors: [
          { message: 'Name is required', members: ['name'] },
          { message: 'Email must be a valid email address', members: ['email'] },
        ],
      },
    },
    {
      label: 'Error with details',
      model: {},
      formErrors: { message: 'Unable to save the record', details: 'Another user changed this record while you were editing it.' },
    },
    { label: 'Error message', model: {}, formErrors: 'Something went wrong while saving.' },
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
  const genericModel: IConfigurableFormComponent = {
    type: componentType,
    id: componentType,
    propertyName: `${componentType}Appearance`,
    label: `${componentDefinition.name} Label`,
    parentId: 'root',
    hidden: false,
    version: 'latest',
  };
  const baseModel: IConfigurableFormComponent = componentDefinition.previewConfiguration ??
    (PREVIEW_AS_NEW_COMPONENT.has(componentType) ? createNewComponentModel(componentDefinition, genericModel) : genericModel);

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
