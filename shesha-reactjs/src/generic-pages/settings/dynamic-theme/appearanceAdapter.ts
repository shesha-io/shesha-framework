/**
 * Appearance markup adapter for the Component Defaults panel.
 *
 * The Component Defaults panel only renders the "Appearance" tab of each component's settings form.
 * Some components, however, expose properties on *other* tabs that meaningfully change how the
 * component looks — e.g. the File Upload component's `listType` (which switches between a file-name
 * list and a thumbnail preview) lives on the "Common" tab.
 *
 * This adapter lets us declare, per component type, a set of extra property names that should be
 * surfaced in the appearance markup even though they live elsewhere in the settings form. It locates
 * those properties anywhere in the settings markup tree (across tabs, nested containers, and
 * `settingsInputRow` inputs) and returns ready-to-render markup nodes to prepend to the appearance
 * tab.
 */

import { IConfigurableFormComponent } from '@/providers/form/models';
import { nanoid } from '@/utils/uuid';

/**
 * Per-component-type configuration of extra properties to surface in the appearance markup.
 * The keys are component types; the values are the `propertyName`s to pull in from other tabs.
 *
 * To surface a new property, add its `propertyName` here under the relevant component type.
 */
export const APPEARANCE_EXTRA_PROPERTIES: Record<string, string[]> = {
  // File Upload: `listType` toggles between a file-name list and a thumbnail preview, which changes
  // the component's appearance, so allow theming/previewing it from the appearance panel.
  fileUpload: ['listType'],
  attachmentsEditor: ['listType'],
};

/** A markup node that carries child inputs (e.g. settingsInputRow). */
interface IInputsContainer {
  inputs?: unknown[];
}

const hasInputs = (node: unknown): node is IInputsContainer =>
  typeof node === 'object' && node !== null && Array.isArray((node as IInputsContainer).inputs);

const hasComponents = (node: unknown): node is { components: unknown[] } =>
  typeof node === 'object' && node !== null && Array.isArray((node as { components?: unknown }).components);

const hasTabs = (node: unknown): node is { tabs: unknown[] } =>
  typeof node === 'object' && node !== null && Array.isArray((node as { tabs?: unknown }).tabs);

const getPropertyName = (node: unknown): string | undefined => {
  if (typeof node !== 'object' || node === null) return undefined;
  const name = (node as { propertyName?: unknown }).propertyName;
  return typeof name === 'string' ? name : undefined;
};

/**
 * Result of locating a property in the settings markup. `kind` distinguishes a standalone component
 * (renderable as-is) from a row input (must be wrapped in a settingsInputRow to render).
 */
interface IFoundProperty {
  node: Record<string, unknown>;
  kind: 'component' | 'rowInput';
}

/**
 * Recursively walks a settings-markup node tree looking for nodes whose `propertyName` is in the
 * requested set. Searches standalone components (`components`), tab panes (`tabs`), and the `inputs`
 * of `settingsInputRow` nodes. Stops collecting once every requested property is found.
 */
const collectProperties = (
  nodes: unknown[],
  wanted: Set<string>,
  found: Map<string, IFoundProperty>,
): void => {
  for (const node of nodes) {
    if (found.size === wanted.size) return;
    if (typeof node !== 'object' || node === null) continue;

    const propertyName = getPropertyName(node);
    if (propertyName && wanted.has(propertyName) && !found.has(propertyName)) {
      found.set(propertyName, { node: node as Record<string, unknown>, kind: 'component' });
    }

    // settingsInputRow inputs: these are not standalone components, so flag them for wrapping.
    if (hasInputs(node)) {
      for (const input of node.inputs ?? []) {
        const inputName = getPropertyName(input);
        if (inputName && wanted.has(inputName) && !found.has(inputName)) {
          found.set(inputName, { node: input as Record<string, unknown>, kind: 'rowInput' });
        }
      }
    }

    if (hasComponents(node)) collectProperties(node.components, wanted, found);
    if (hasTabs(node)) {
      for (const tab of node.tabs) {
        if (hasComponents(tab)) collectProperties(tab.components, wanted, found);
      }
    }
  }
};

/**
 * Wraps a located node into a renderable appearance-markup component.
 *  - standalone components are deep-cloned with a fresh id and forced visible,
 *  - row inputs are wrapped in a `settingsInputRow` (and visibility conditions tied to other tabs are
 *    stripped so the control always shows in the preview panel).
 */
const toRenderable = (found: IFoundProperty): IConfigurableFormComponent => {
  const clone = JSON.parse(JSON.stringify(found.node)) as Record<string, unknown>;
  // Force the control to be visible regardless of cross-field conditions defined on its original tab.
  delete clone.hidden;
  delete clone.visible;
  delete clone.visibleJs;

  if (found.kind === 'component') {
    clone.id = nanoid();
    return clone as unknown as IConfigurableFormComponent;
  }

  // Row input → wrap in a settingsInputRow so it renders like it does in the settings form.
  return {
    id: nanoid(),
    type: 'settingsInputRow',
    propertyName: `appearanceExtra_${(clone.propertyName as string) ?? nanoid()}`,
    parentId: 'root',
    hidden: false,
    inputs: [clone],
  } as unknown as IConfigurableFormComponent;
};

/**
 * Builds the extra appearance-markup components for a component type by locating its configured extra
 * properties anywhere in the full settings markup.
 *
 * @param componentType  the type of the selected component (e.g. 'fileUpload')
 * @param settingsComponents  the full top-level components array of the component's settings form
 * @returns markup components to prepend to the appearance tab (empty when nothing is configured/found)
 */
export const getExtraAppearanceComponents = (
  componentType: string | undefined,
  settingsComponents: IConfigurableFormComponent[] | undefined,
): IConfigurableFormComponent[] => {
  if (!componentType || !settingsComponents) return [];

  const wantedNames = APPEARANCE_EXTRA_PROPERTIES[componentType];
  if (!wantedNames?.length) return [];

  const wanted = new Set(wantedNames);
  const found = new Map<string, IFoundProperty>();
  collectProperties(settingsComponents, wanted, found);

  // Preserve the declared order of the configured property names.
  return wantedNames
    .map((name) => found.get(name))
    .filter((f): f is IFoundProperty => !!f)
    .map(toRenderable);
};
