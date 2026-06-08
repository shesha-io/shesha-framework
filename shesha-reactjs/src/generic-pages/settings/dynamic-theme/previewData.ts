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
