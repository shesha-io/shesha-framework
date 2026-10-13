import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IConfigurableFormComponent, IFlatComponentsStructure, isConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { getComponentContainers } from '@/providers/form/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { nanoid } from '@/utils/uuid';
import { getOwnContainerId, getParentContainerId, IContainerOwnership } from './structure/containers';
import { getItemsLimitReason } from './structure/moveComponent';

const MARKER = 'form-components';
const VERSION = 1;

export type ClipboardContent =
  { kind: 'components'; components: IConfigurableFormComponent[] } |
  { kind: 'settings'; componentType: string; settings: Record<string, unknown> };

export type ParsedClipboard = ClipboardContent | { kind: 'newer-version' };

/** Plain JSON, so a copy can be pasted into another tab, window or browser */
export const toClipboardText = (content: ClipboardContent): string => JSON.stringify({ shesha: MARKER, version: VERSION, ...content });

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Reads text written by toClipboardText; anything else gives undefined */
export const parseClipboardText = (text: string): ParsedClipboard | undefined => {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') || !trimmed.includes(`"${MARKER}"`))
    return undefined;
  let value: unknown;
  try {
    value = JSON.parse(trimmed);
  } catch {
    return undefined;
  }
  if (!isRecord(value) || value['shesha'] !== MARKER || typeof value['version'] !== 'number')
    return undefined;
  if (value['version'] > VERSION)
    return { kind: 'newer-version' };

  const { kind, components, componentType, settings } = value;
  if (kind === 'components' && Array.isArray(components) && components.length > 0 && components.every(isConfigurableFormComponent))
    return { kind, components };
  if (kind === 'settings' && typeof componentType === 'string' && isRecord(settings))
    return { kind, componentType, settings };
  return undefined;
};

/** Why these components can't be pasted into this app, or undefined when they can */
export const getPasteProblem = (components: readonly IConfigurableFormComponent[], getDefinition: FormDesignerComponentGetter): string | undefined => {
  const missing = new Set<string>();
  const isValid = (item: unknown): boolean => {
    if (!isConfigurableFormComponent(item))
      return false;
    const definition = getDefinition(item.type);
    if (!isDefined(definition)) {
      missing.add(item.type);
      return true;
    }
    return getComponentContainers(item, definition).every((container) => container.components.every(isValid));
  };
  if (!components.every(isValid))
    return "The clipboard doesn't contain form components.";
  return missing.size > 0 ? `This app doesn't have these components: ${[...missing].join(', ')}.` : undefined;
};

/**
 * Gives the components, and every pane, step or column inside them, new ids. A wizard's default step and actions owned
 * by a copied component (a table's toolbar buttons) follow. Changes the components in place.
 */
export const renewIds = (components: readonly IConfigurableFormComponent[], getDefinition: FormDesignerComponentGetter): void => {
  const newIds = new Map<string, string>();
  const renew = (component: IConfigurableFormComponent): void => {
    const containers = getComponentContainers(component, getDefinition(component.type));
    const ownId = component.id;
    component.id = nanoid();
    newIds.set(ownId, component.id);

    containers.forEach((container) => {
      if (container.id !== ownId && 'id' in container.source) {
        const newId = nanoid();
        newIds.set(container.id, newId);
        Reflect.set(container.source, 'id', newId);
      }
      container.components.forEach(renew);
    });
  };
  components.forEach(renew);

  // Tabs keep their default tab by key, and keys don't change
  const follow = (value: unknown): void => {
    if (Array.isArray(value))
      value.forEach(follow);
    else if (isRecord(value))
      Object.entries(value).forEach(([key, item]) => {
        const newId = typeof item === 'string' && (key === 'actionOwner' || key === 'defaultActiveStep') ? newIds.get(item) : undefined;
        if (isDefined(newId))
          value[key] = newId;
        else
          follow(item);
      });
  };
  follow(components);
};

export interface INameChange {
  from: string;
  to: string;
}

/** Numbers component names that are already used (txtEmail → txtEmail2). Labels never change. Changes the components in place */
export const resolveNameClashes = (components: readonly IConfigurableFormComponent[], usedNames: ReadonlySet<string>, getDefinition: FormDesignerComponentGetter): INameChange[] => {
  const used = new Set(usedNames);
  const changes: INameChange[] = [];
  const visit = (component: IConfigurableFormComponent): void => {
    const name = component.componentName;
    if (!isNullOrWhiteSpace(name)) {
      let newName = name;
      if (used.has(name)) {
        const base = name.replace(/\d+$/, '') || name;
        let n = 2;
        while (used.has(`${base}${n}`))
          n++;
        newName = `${base}${n}`;
        component.componentName = newName;
        changes.push({ from: name, to: newName });
      }
      used.add(newName);
    }
    getComponentContainers(component, getDefinition(component.type)).forEach((container) => container.components.forEach(visit));
  };
  components.forEach(visit);
  return changes;
};

export type PasteMode = 'auto' | 'after' | 'inside';

/** The selected component, or a pane (tab, step, column...) picked in Layers */
export interface IPasteSelection {
  componentId?: string | undefined;
  containerId?: string | undefined;
}

export type PasteTarget = { containerId: string; index: number } | { reason: string };

/**
 * Where pasted components go: inside the selection when it can hold children (unless `after`), otherwise right after
 * it; the end of the form when nothing is selected.
 */
export const getPasteTarget = (
  markup: IFlatComponentsStructure,
  ownership: IContainerOwnership,
  getDefinition: FormDesignerComponentGetter,
  selection: IPasteSelection,
  mode: PasteMode,
  count: number,
): PasteTarget => {
  const childCount = (containerId: string): number => (markup.componentRelations[containerId] ?? []).length;
  const checked = (containerId: string, index: number): PasteTarget => {
    const ownerId = ownership.ownerOf.get(containerId);
    const owner = isDefined(ownerId) ? markup.allComponents[ownerId] : undefined;
    const reason = containerId === ownerId && isConfigurableFormComponent(owner)
      ? getItemsLimitReason(getDefinition(owner.type), childCount(containerId), count)
      : undefined;
    return isDefined(reason) ? { reason } : { containerId, index };
  };
  const after = (componentId: string): PasteTarget => {
    const containerId = getParentContainerId(markup, componentId) ?? ROOT_COMPONENT_KEY;
    const position = (markup.componentRelations[containerId] ?? []).indexOf(componentId);
    return checked(containerId, position < 0 ? childCount(containerId) : position + 1);
  };

  const { componentId, containerId } = selection;
  if (isDefined(containerId)) {
    const ownerId = ownership.ownerOf.get(containerId);
    return mode === 'after' && isDefined(ownerId) ? after(ownerId) : checked(containerId, childCount(containerId));
  }
  const component = isDefined(componentId) ? markup.allComponents[componentId] : undefined;
  if (!isConfigurableFormComponent(component))
    return checked(ROOT_COMPONENT_KEY, childCount(ROOT_COMPONENT_KEY));
  if (mode !== 'after') {
    const definition = getDefinition(component.type);
    const ownContainerId = getOwnContainerId(component, definition, markup, getComponentContainers(component, definition));
    if (isDefined(ownContainerId))
      return checked(ownContainerId, childCount(ownContainerId));
  }
  return after(component.id);
};
