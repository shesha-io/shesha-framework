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
          { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [childComponent('text', { content: 'Left column' } as Partial<IConfigurableFormComponent>)] },
          { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [childComponent('text', { content: 'Right column' } as Partial<IConfigurableFormComponent>)] },
        ],
        gutterX: 8,
        gutterY: 8,
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
    default:
      // Generic fallback: any bound input gets a sample string.
      return isInputComponent(type) ? 'Sample value' : undefined;
  }
};

/**
 * Builds the data object passed to the preview form so the previewed component shows dummy data.
 * Merges the supplied theme (used for layout/appearance) with the dummy bound value.
 */
export const getPreviewFormData = (type: string | undefined, theme: object | undefined): object => {
  const base = { ...(theme ?? {}) };
  const value = getPreviewInitialValue(type);
  if (value !== undefined) {
    (base as Record<string, unknown>)[PREVIEW_PROPERTY_NAME] = value;
  }
  return base;
};

/**
 * Component types that only render data when they live inside a Data Context bound to a data source.
 * In the designer these are populated by dropping them into a `dataContext` configured against the
 * seeded `Shesha.Core.DummyTable` entity; we reproduce that exact tree here so the preview shows the
 * same sample rows the designer does.
 */
const DATA_BOUND_COMPONENT_TYPES = new Set(['datatable', 'datalist', 'quickSearch', '']);

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

    const child = applyInitModel(type, {
      type,
      id: childId,
      propertyName: `${type}_${childId}`,
      label,
      parentId: contextId,
      hidden: false,
      ...extraChildProps,
    } as IConfigurableFormComponent);

    const children: IConfigurableFormComponent[] = [child];

    // The DataList relies on a sibling that registers columns to trigger the context's data fetch; on
    // its own nothing tells the context which data to load. Add a driver table (with the DummyTable
    // columns) so the shared context loads sample rows that the DataList then renders.
    //
    // The driver must stay mounted to drive the fetch, so we can't use `hidden` (the table/container
    // return `null` when hidden, which would stop the fetch). Instead we wrap it in a container whose
    // wrapper is styled `display: none` — the table still mounts, registers columns and fetches, but is
    // not visible, so only the DataList shows in the preview.
    if (type === 'datalist') {
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

  const component = applyInitModel(type, {
    type,
    id: baseId,
    propertyName,
    label,
    parentId: 'root',
    hidden: false,
    ...getPreviewComponentProps(type),
  } as IConfigurableFormComponent);

  return [component];
};
