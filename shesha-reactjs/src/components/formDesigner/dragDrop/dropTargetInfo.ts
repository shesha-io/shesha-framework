/** Label used for containers that are not inside a component, i.e. the root of the form. */
export const ROOT_DROP_TARGET_LABEL = 'Form';

/**
 * What the highlight frame is drawn around: the whole owning component (its main area, e.g. a Panel's body) or just
 * the container (a part of the component, e.g. a Panel's header or one of several columns).
 */
export type DropTargetFrame = 'component' | 'container';

export interface IDropTargetInfo {
  label: string;
  frame: DropTargetFrame;
}

/** The designer component a container is rendered by. */
export interface IDropTargetOwner {
  name: string;
  model: object;
}

/** Properties that hold a component's main area rather than one of its parts. */
const MAIN_CONTAINER_KEYS = new Set(['content', 'body', 'components']);
/** Properties of an array item (a tab, a column, a step) that hold its display name, in order of preference. */
const ITEM_TITLE_KEYS = ['title', 'label', 'name', 'key'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** `customHeader` -> `Custom header`, `stepFooter` -> `Step footer` */
const humanize = (key: string): string => {
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const singular = (key: string): string => (key.endsWith('s') && key.length > 1 ? key.slice(0, -1) : key);

const getItemTitle = (item: Record<string, unknown>, arrayKey: string, index: number): string => {
  for (const key of ITEM_TITLE_KEYS) {
    const value = item[key];
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
  }
  return `${humanize(singular(arrayKey))} ${index + 1}`;
};

const hasId = (value: unknown, id: string): value is Record<string, unknown> => isRecord(value) && value['id'] === id;

const part = (owner: IDropTargetOwner, partName: string): IDropTargetInfo => ({ label: `${owner.name} › ${partName}`, frame: 'container' });

/**
 * Names a drop container after the component that owns it, and says whether dropping into it means dropping into the
 * component as a whole or into one of its parts. Containers are found in the owner's model by id: a container of the
 * component itself, a property such as `header` or `content`, or an item of an array such as `tabs` or `columns`.
 */
export const getDropTargetInfo = (owner: IDropTargetOwner | undefined, containerId: string): IDropTargetInfo => {
  if (!owner) return { label: ROOT_DROP_TARGET_LABEL, frame: 'container' };

  const whole: IDropTargetInfo = { label: owner.name, frame: 'component' };
  const model = owner.model as Record<string, unknown>;
  if (model['id'] === containerId) return whole;

  for (const [key, value] of Object.entries(model)) {
    if (hasId(value, containerId))
      return MAIN_CONTAINER_KEYS.has(key) ? whole : part(owner, humanize(key));

    if (!Array.isArray(value)) continue;
    for (let index = 0; index < value.length; index++) {
      const item: unknown = value[index];
      if (!isRecord(item)) continue;
      if (item['id'] === containerId) return part(owner, getItemTitle(item, key, index));

      // a container nested in an array item, e.g. the footer of a wizard step
      for (const [itemKey, itemValue] of Object.entries(item)) {
        if (hasId(itemValue, containerId))
          return part(owner, `${getItemTitle(item, key, index)} ${humanize(itemKey).toLowerCase()}`);
      }
    }
  }

  return whole;
};
