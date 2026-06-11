/**
 * Preview dummy-data helpers for the Component Defaults preview card.
 *
 * The preview card renders a single component with the current theme applied so the user can see
 * how a component will look by default. Many components render nothing useful on their own:
 *  - input components (text field, number field, dropdown, ...) show an empty control unless a value
 *    is bound to them,
 *  - layout/container components (container, columns, tabs, card, ...) render an empty box unless they
 *    contain child components,
 *  - output/display components (text, statistic, alert, ...) need content to display.
 *
 * These helpers inject sensible dummy content/children/values keyed by the component type so every
 * component demonstrates how it looks with data. Containers in particular get child components so the
 * configured display type (flex / grid / block) is visible.
 */

import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { nanoid } from '@/utils/uuid';

/** Property name used to bind dummy data to the previewed component in the form data object. */
export const PREVIEW_PROPERTY_NAME = 'previewValue';

/** Build a minimal child component markup node for use inside a preview container. */
const childComponent = (
  type: string,
  props: Partial<IConfigurableFormComponent> = {},
): IConfigurableFormComponent =>
  ({
    id: nanoid(),
    type,
    propertyName: `${type}_${nanoid()}`,
    parentId: 'root',
    hidden: false,
    ...props,
  }) as IConfigurableFormComponent;

/** A small set of "leaf" components used to populate containers so their layout is visible. */
const sampleChildren = (): IConfigurableFormComponent[] => [
  childComponent('text', { content: 'Item one', contentDisplay: 'content', textType: 'span' } as Partial<IConfigurableFormComponent>),
  childComponent('text', { content: 'Item two', contentDisplay: 'content', textType: 'span' } as Partial<IConfigurableFormComponent>),
  childComponent('text', { content: 'Item three', contentDisplay: 'content', textType: 'span' } as Partial<IConfigurableFormComponent>),
];

/**
 * Inline option list for choice components (radio, checkbox group, dropdown, ...). Using
 * `dataSourceType: 'values'` keeps the preview self-contained (no reference list / API needed) so the
 * control always renders visible options for the user to style.
 */
const sampleOptions = (): Array<{ id: string; label: string; value: string }> => [
  { id: nanoid(), label: 'Option one', value: '1' },
  { id: nanoid(), label: 'Option two', value: '2' },
  { id: nanoid(), label: 'Option three', value: '3' },
];

/** Props that make a choice component render an inline list of dummy options. */
const choiceComponentProps = (): Partial<IConfigurableFormComponent> =>
  ({
    dataSourceType: 'values',
    items: sampleOptions(),
  }) as unknown as Partial<IConfigurableFormComponent>;

/**
 * Build a single column object (used by `columns`, `sizableColumns`, `keyInformationBar`) carrying its
 * own child components so the column renders something visible to style.
 */
const sampleColumnChildren = (label: string): IConfigurableFormComponent[] => [
  childComponent('text', { content: label, contentDisplay: 'content', textType: 'span' } as Partial<IConfigurableFormComponent>),
];

/**
 * Dummy "step" items for the chevron / kanban (both render a reference-list-like list of items with a
 * numeric `itemValue` and a display `item` label). Self-contained so no reference list is needed.
 */
const sampleStepItems = (): Array<{ id: string; itemValue: number; item: string }> => [
  { id: nanoid(), itemValue: 1, item: 'To do' },
  { id: nanoid(), itemValue: 2, item: 'In progress' },
  { id: nanoid(), itemValue: 3, item: 'Done' },
];

/**
 * Returns extra model props to merge into the previewed component so it renders with dummy content.
 *
 * For container/layout components this includes child `components` that demonstrate the configured
 * display type. For display components it includes content/text. Input components are handled
 * separately via {@link getPreviewInitialValues}, but a few also get a `defaultValue` here.
 */
export const getPreviewComponentProps = (type: string | undefined): Partial<IConfigurableFormComponent> => {
  if (!type) return {};

  switch (type) {
    // ----- Containers / layout: give them children so the display type (flex/grid/block) is visible
    case 'container':
      return {
        components: sampleChildren(),
        // ensure children are laid out visibly even if the theme leaves display unset
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
      } as Partial<IConfigurableFormComponent>;

    case 'columns':
      return {
        columns: [
          { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: sampleColumnChildren('Left column') },
          { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: sampleColumnChildren('Right column') },
        ],
        gutterX: 8,
        gutterY: 8,
      } as unknown as Partial<IConfigurableFormComponent>;

    case 'sizableColumns':
      // Two resizable columns (sizes are percentages that sum to 100) each with visible content.
      return {
        columns: [
          { id: nanoid(), size: 50, components: sampleColumnChildren('Left pane') },
          { id: nanoid(), size: 50, components: sampleColumnChildren('Right pane') },
        ],
      } as unknown as Partial<IConfigurableFormComponent>;

    case 'KeyInformationBar':
      // A horizontal bar of "key information" cells, each a column with sample content.
      return {
        orientation: 'horizontal',
        columns: [
          { id: nanoid(), width: 200, textAlign: 'center', flexDirection: 'column', padding: '8px', components: sampleColumnChildren('Total: 1,234') },
          { id: nanoid(), width: 200, textAlign: 'center', flexDirection: 'column', padding: '8px', components: sampleColumnChildren('Active: 567') },
          { id: nanoid(), width: 200, textAlign: 'center', flexDirection: 'column', padding: '8px', components: sampleColumnChildren('Pending: 89') },
        ],
      } as unknown as Partial<IConfigurableFormComponent>;

    case 'chevron':
      // Pipeline-style steps; dataSourceType 'values' keeps it self-contained (no reference list).
      return {
        dataSourceType: 'values',
        items: sampleStepItems(),
      } as unknown as Partial<IConfigurableFormComponent>;

    case 'kanban':
      // Kanban renders one column per item (the styled columns are what users style); it must live in a
      // Data Table context (handled by buildPreviewComponents). Tasks stay empty without matching data,
      // but the columns render. `groupingProperty` points at a DummyTable field so the board initialises.
      return {
        items: sampleStepItems(),
        groupingProperty: 'area',
      } as unknown as Partial<IConfigurableFormComponent>;

    // ----- Entity-reference inputs: bind to the seeded core Person entity (same default the designer
    // uses) so the control renders and validates instead of showing a configuration-error icon.
    case 'entityPicker':
      return {
        entityType: 'Shesha.Core.Person',
        placeholder: 'Select an item…',
        title: 'Select an item',
      } as unknown as Partial<IConfigurableFormComponent>;

    case 'entityReference':
      // The entityReference renders a styleable link/button. Its migrator forces
      // `formSelectionMode: 'name'` + `entityReferenceType: 'Quickview'`, and the control needs a target
      // form to fully resolve — without one it renders an immediate, styleable button (font / colour /
      // border / background all apply), which is enough for a default-appearance preview. We avoid
      // supplying a dummy formIdentifier on purpose, since that makes it hang on a never-resolving fetch.
      return {
        entityType: 'Shesha.Core.Person',
        displayType: 'textTitle',
        textTitle: 'Sample reference',
      } as unknown as Partial<IConfigurableFormComponent>;

    case 'collapsiblePanel':
    case 'card':
      return { components: sampleChildren() } as Partial<IConfigurableFormComponent>;

    case 'tabs':
      return {
        tabs: [
          { id: nanoid(), title: 'Tab 1', key: nanoid(), components: sampleChildren() },
          { id: nanoid(), title: 'Tab 2', key: nanoid(), components: [childComponent('text', { content: 'Second tab content' } as Partial<IConfigurableFormComponent>)] },
        ],
      } as unknown as Partial<IConfigurableFormComponent>;

    // ----- Choice components: show inline dummy options so the user can see them styled
    case 'radio':
    case 'dropdown':
    case 'checkboxGroup':
      return choiceComponentProps();

    // ----- Display / output components
    case 'text':
      return { content: 'The quick brown fox jumps over the lazy dog', contentDisplay: 'content', textType: 'span' } as Partial<IConfigurableFormComponent>;

    case 'alert':
      return { text: 'This is a sample alert message', alertType: 'info', showIcon: true } as unknown as Partial<IConfigurableFormComponent>;

    case 'statistic':
      return { value: 1234, title: 'Sample statistic' } as unknown as Partial<IConfigurableFormComponent>;

    case 'progress':
      return { percent: 60, defaultValue: 60 } as unknown as Partial<IConfigurableFormComponent>;

    case 'link':
      return { content: 'Sample link', href: '#' } as unknown as Partial<IConfigurableFormComponent>;

    case 'markdown':
      return { content: '# Sample heading\n\nSome **markdown** content.' } as unknown as Partial<IConfigurableFormComponent>;

    // ----- Buttons already default to a "Submit" label via initModel; nothing extra needed.
    default:
      return {};
  }
};

/** Whether a component type is a bound input (i.e. reads/writes a value on the form data). */
export const isInputComponent = (type: string | undefined): boolean => {
  if (!type) return false;
  const def = getComponentDefinitions().get(type);
  return !!def?.isInput;
};

/**
 * Returns dummy form data (keyed by {@link PREVIEW_PROPERTY_NAME}) for input components so the bound
 * control shows a sample value instead of rendering empty. Returns `undefined` when the component is
 * not a bound input or when no sensible sample exists.
 */
export const getPreviewInitialValue = (type: string | undefined): unknown => {
  if (!type) return undefined;

  switch (type) {
    case 'numberField':
    case 'slider':
    case 'rate':
      return 4;
    case 'dateField':
      return new Date().toISOString();
    case 'switch':
    case 'checkbox':
    case 'threeStateSwitch':
      return true;
    case 'colorPicker':
      return '#1890ff';
    case 'radio':
    case 'dropdown':
      // Select the first sample option (see choiceComponentProps / sampleOptions).
      return '1';
    case 'checkboxGroup':
      // Checkbox group binds to an array of selected values.
      return ['1', '2'];
    case 'textArea':
      return 'The quick brown fox jumps over the lazy dog.';
    case 'password':
    case 'passwordCombo':
      return 'P@ssw0rd';
    case 'chevron':
      // Highlight the second step (matches an itemValue from sampleStepItems).
      return 2;
    case 'entityReference':
      // A value object carrying both an id and a display name satisfies the control's "has value" check
      // without triggering a backend fetch (the display name is already present), so the styleable link
      // button renders with sample text.
      return { id: '00000000-0000-0000-0000-000000000001', _displayName: 'Sample reference', _className: 'Shesha.Core.Person' };
    case 'entityPicker':
    case 'kanban':
      // These show their dummy structure via component props (placeholder / columns), not a bound value;
      // keep them empty so no backend lookup is attempted for a fake id.
      return undefined;
    default:
      // Generic fallback: any bound input gets a sample string.
      return isInputComponent(type) ? 'Sample value' : undefined;
  }
};


/**
 * Component types that only render data when they live inside a Data Context bound to a data source.
 * In the designer these are populated by dropping them into a `dataContext` configured against the
 * seeded `Shesha.Core.DummyTable` entity; we reproduce that exact tree here so the preview shows the
 * same sample rows the designer does.
 */
const DATA_BOUND_COMPONENT_TYPES = new Set(['datatable', 'datalist', 'kanban', 'datatable.pager', 'datatable.quickSearch', 'datatable.filter']);

/**
 * Data-bound components that don't register columns themselves and therefore need a hidden sibling
 * "driver" table to trigger the shared context's data fetch (see buildPreviewComponents).
 */
const NEEDS_DRIVER_TABLE = new Set(['datalist', 'kanban']);

/**
 * Whether a component must render in designer mode for its preview to show sample content the way the
 * designer canvas does. The DataList only renders per-row item cards (placeholders when no row form is
 * configured) in designer mode — in edit/runtime mode it renders nothing for unconfigured rows — so
 * its preview must run in designer mode to match the canvas.
 */
export const previewNeedsDesignerMode = (type: string | undefined): boolean => type === 'datalist';

/** The type of the Data Context (table context) designer component. */
const DATA_CONTEXT_TYPE = 'dataContext';

/**
 * Default data columns for the table preview, matching the seeded `Shesha.Core.DummyTable` entity
 * (country / city / population / area / fun fact). In the designer the table auto-derives these from
 * the entity metadata, but that auto-configuration only runs in designer mode; the preview renders in
 * edit mode, so we provide the equivalent columns explicitly. Shape matches `IDataColumnsProps`
 * (see designer-components/dataTable/table/utils.ts → propertyToDataColumn).
 */
const dummyTableColumns = (): Array<Record<string, unknown>> => {
  const column = (propertyName: string, caption: string, sortOrder: number): Record<string, unknown> => ({
    id: propertyName,
    columnType: 'data',
    itemType: 'item',
    caption,
    propertyName,
    accessor: propertyName,
    sortOrder,
    isVisible: true,
    allowSorting: true,
  });

  return [
    column('country', 'Country', 0),
    column('city', 'City', 1),
    column('population', 'Population', 2),
    column('area', 'Area', 3),
    column('funFact', 'Fun Fact', 4),
  ];
};

/**
 * Applies a component's `initModel` (the same hook the designer runs when a component is dropped onto
 * the canvas) so the preview component gets the same defaults — e.g. the Data Context binds to
 * `Shesha.Core.DummyTable`, the table/datalist get their default settings. Falls back to the raw model
 * when the component has no `initModel`.
 */
const applyInitModel = (type: string, model: IConfigurableFormComponent): IConfigurableFormComponent => {
  const def = getComponentDefinitions().get(type);
  if (!def?.initModel) return model;
  try {
    return def.initModel(model as never) as IConfigurableFormComponent;
  } catch {
    // initModel may rely on runtime context not present here; keep the base model in that case.
    return model;
  }
};

/** A single preview variation: a human label plus the model prop-overrides that produce it. */
interface IPreviewVariation {
  label: string;
  props: Partial<IConfigurableFormComponent>;
  /** Optional bound value for this variation (input components only) when it differs per variation. */
  value?: unknown;
}

/**
 * Components that have meaningful visual variations (driven by a single model prop) which the user can
 * style. The preview renders one instance per variation — each labelled — mirroring how the Theme tab
 * shows every alert/button kind at once, so the user can see all states they are styling.
 *
 * To add a variation: add the component `type` here with the list of label + prop overrides. The
 * overrides are layered on top of the component's default dummy props (see getPreviewComponentProps).
 */
const COMPONENT_VARIATIONS: Record<string, IPreviewVariation[]> = {
  button: [
    { label: 'Primary', props: { buttonType: 'primary' } as Partial<IConfigurableFormComponent> },
    { label: 'Default', props: { buttonType: 'default' } as Partial<IConfigurableFormComponent> },
    { label: 'Dashed', props: { buttonType: 'dashed' } as Partial<IConfigurableFormComponent> },
    { label: 'Link', props: { buttonType: 'link' } as Partial<IConfigurableFormComponent> },
    { label: 'Text', props: { buttonType: 'text' } as Partial<IConfigurableFormComponent> },
    { label: 'Ghost', props: { buttonType: 'ghost' } as Partial<IConfigurableFormComponent> },
  ],
  // File Upload / Attachments: file-name list vs thumbnail grid.
  fileUpload: [
    { label: 'File name', props: { listType: 'text' } as unknown as Partial<IConfigurableFormComponent> },
    { label: 'Thumbnail', props: { listType: 'thumbnail' } as unknown as Partial<IConfigurableFormComponent> },
  ],
  attachmentsEditor: [
    { label: 'File name', props: { listType: 'text' } as unknown as Partial<IConfigurableFormComponent> },
    { label: 'Thumbnail', props: { listType: 'thumbnail' } as unknown as Partial<IConfigurableFormComponent> },
  ],
  // Choice components: single vs multiple selection (each variation binds an appropriate sample value).
  checkboxGroup: [
    { label: 'Single', props: { mode: 'single' } as unknown as Partial<IConfigurableFormComponent>, value: ['1'] },
    { label: 'Multiple', props: { mode: 'multiple' } as unknown as Partial<IConfigurableFormComponent>, value: ['1', '2'] },
  ],
  dropdown: [
    { label: 'Single', props: { mode: 'single' } as unknown as Partial<IConfigurableFormComponent>, value: '1' },
    { label: 'Multiple', props: { mode: 'multiple' } as unknown as Partial<IConfigurableFormComponent>, value: ['1', '2'] },
  ],
  // Text: span vs paragraph vs heading.
  text: [
    { label: 'Span', props: { textType: 'span', content: 'The quick brown fox jumps over the lazy dog' } as unknown as Partial<IConfigurableFormComponent> },
    { label: 'Paragraph', props: { textType: 'paragraph', content: 'The quick brown fox jumps over the lazy dog' } as unknown as Partial<IConfigurableFormComponent> },
    { label: 'Title', props: { textType: 'title', content: 'Sample title' } as unknown as Partial<IConfigurableFormComponent> },
  ],
  // Progress: line vs circle vs dashboard.
  progress: [
    { label: 'Line', props: { progressType: 'line' } as unknown as Partial<IConfigurableFormComponent> },
    { label: 'Circle', props: { progressType: 'circle' } as unknown as Partial<IConfigurableFormComponent> },
    { label: 'Dashboard', props: { progressType: 'dashboard' } as unknown as Partial<IConfigurableFormComponent> },
  ],
};

/** Deterministic property name for the Nth input variation, so each binds its own sample value. */
const variationPropertyName = (index: number): string => `${PREVIEW_PROPERTY_NAME}V${index}`;

/**
 * Builds the data object passed to the preview form so the previewed component shows dummy data.
 * Merges the supplied theme (used for layout/appearance) with the dummy bound value. When the component
 * is rendered as multiple input variations, each variation's value is keyed by its own property name
 * (see variationPropertyName) so they don't collide.
 */
export const getPreviewFormData = (type: string | undefined, theme: object | undefined): object => {
  const base = { ...(theme ?? {}) } as Record<string, unknown>;
  const value = getPreviewInitialValue(type);
  if (value !== undefined) {
    base[PREVIEW_PROPERTY_NAME] = value;
  }

  // Per-variation values for input components rendered as multiple variations.
  if (type && isInputComponent(type)) {
    COMPONENT_VARIATIONS[type]?.forEach((v, index) => {
      if (v.value !== undefined) base[variationPropertyName(index)] = v.value;
    });
  }

  return base;
};

/**
 * Builds the root preview component(s) for the selected component type.
 *
 * For most components this is a single node (the component itself, with dummy props applied). For
 * data-bound components (table / datalist) it returns a Data Context node bound to the seeded
 * `Shesha.Core.DummyTable`, with the selected component nested inside as a child — mirroring what the
 * designer produces when you drag a table/datalist into a data context, so the preview is populated
 * with the same sample data.
 *
 * @param type   the selected component type
 * @param baseId a stable id to use for the (outermost) preview component
 * @param label  the component's display label
 */
export const buildPreviewComponents = (
  type: string,
  baseId: string,
  label: string | undefined,
): IConfigurableFormComponent[] => {
  // Input components bind to a known property name so their dummy value is displayed.
  const propertyName = isInputComponent(type) ? PREVIEW_PROPERTY_NAME : `${type}Appearance`;

  if (DATA_BOUND_COMPONENT_TYPES.has(type)) {
    const contextId = baseId;
    const childId = nanoid();

    // The selected data-bound component, nested in the context.
    //  - datatable: needs columns to display the fetched rows. In the designer these are auto-derived
    //    from entity metadata (designer-mode only), so for the preview we supply the equivalent
    //    DummyTable columns explicitly.
    //  - datalist: renders each row through an item form. When that form isn't configured the DataList
    //    shows per-row placeholder cards (designer mode — see previewNeedsDesignerMode), matching the
    //    designer canvas. It does not register columns itself, so on its own nothing tells the context
    //    which data to fetch; we add a hidden sibling table (below) to drive the shared fetch so the
    //    DataList actually receives sample rows.
    const extraChildProps: Partial<IConfigurableFormComponent> =
      type === 'datatable'
        ? ({ items: dummyTableColumns() } as unknown as Partial<IConfigurableFormComponent>)
        : {};

    // Apply initModel first, then layer preview props on top so they win (see note in the non-data-bound
    // branch below) — e.g. kanban's column `items` must survive its initModel.
    const childBase = applyInitModel(type, {
      type,
      id: childId,
      propertyName: `${type}_${childId}`,
      label,
      parentId: contextId,
      hidden: false,
    } as IConfigurableFormComponent);

    const child = {
      ...childBase,
      // Component-specific dummy props (e.g. kanban's column items) so it renders its styled structure.
      ...getPreviewComponentProps(type),
      ...extraChildProps,
    } as IConfigurableFormComponent;

    const children: IConfigurableFormComponent[] = [child];

    // The DataList relies on a sibling that registers columns to trigger the context's data fetch; on
    // its own nothing tells the context which data to load. Add a driver table (with the DummyTable
    // columns) so the shared context loads sample rows that the DataList then renders.
    //
    // The driver must stay mounted to drive the fetch, so we can't use `hidden` (the table/container
    // return `null` when hidden, which would stop the fetch). Instead we wrap it in a container whose
    // wrapper is styled `display: none` — the table still mounts, registers columns and fetches, but is
    // not visible, so only the DataList shows in the preview.
    if (NEEDS_DRIVER_TABLE.has(type)) {
      const driverContainerId = nanoid();
      const driverId = nanoid();

      const driverTable = applyInitModel('datatable', {
        type: 'datatable',
        id: driverId,
        propertyName: `datatable_${driverId}`,
        label: 'data loader',
        parentId: driverContainerId,
        hidden: false,
        items: dummyTableColumns(),
      } as unknown as IConfigurableFormComponent);

      // Container kept mounted but visually collapsed (display:none) so its child table can drive the
      // fetch without appearing in the preview. `style`/`wrapperStyle` are JS-expression strings.
      const hiddenStyle = "return { display: 'none' };";
      const driverContainer = applyInitModel('container', {
        type: 'container',
        id: driverContainerId,
        propertyName: `dataLoader_${driverContainerId}`,
        parentId: contextId,
        hidden: false,
        style: hiddenStyle,
        wrapperStyle: hiddenStyle,
        components: [driverTable],
      } as unknown as IConfigurableFormComponent);

      children.push(driverContainer);
    }

    // Data Context bound to the seeded dummy entity, with the component nested inside as in the designer.
    const context = applyInitModel(DATA_CONTEXT_TYPE, {
      type: DATA_CONTEXT_TYPE,
      id: contextId,
      propertyName: `previewDataContext_${contextId}`,
      componentName: 'previewDataContext',
      label: 'Preview data',
      parentId: 'root',
      hidden: false,
      components: children,
    } as unknown as IConfigurableFormComponent);

    return [context];
  }

  // Apply initModel first (designer defaults), then layer the preview props on top so they win — some
  // components' initModel resets the very props we want to demo (e.g. `columns` initModel replaces the
  // columns with empty ones), which would otherwise blank out our dummy content.
  const buildOne = (id: string, instanceLabel: string | undefined, extraProps: Partial<IConfigurableFormComponent>): IConfigurableFormComponent => {
    const base = applyInitModel(type, {
      type,
      id,
      propertyName,
      label: instanceLabel,
      parentId: 'root',
      hidden: false,
    } as IConfigurableFormComponent);

    return { ...base, ...getPreviewComponentProps(type), ...extraProps } as IConfigurableFormComponent;
  };

  // Components with variations (e.g. button types, file list/thumbnail) render one labelled instance per
  // variation so the user can see every state they are styling — mirroring the Theme tab. Each input
  // variation gets a deterministic propertyName (variationPropertyName) so its bound value (supplied by
  // getPreviewFormData) doesn't collide with the other variations.
  const variations = COMPONENT_VARIATIONS[type];
  if (variations?.length) {
    return variations.map((v, index) => {
      const component = buildOne(nanoid(), v.label, v.props);
      if (isInputComponent(type) && v.value !== undefined) {
        component.propertyName = variationPropertyName(index);
      }
      return component;
    });
  }

  return [buildOne(baseId, label, {})];
};
