import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IFlatComponentsStructure, isConfigurableFormComponent } from '@/providers/form/models';
import { getLayerLabel } from './labels';
import { ILayersIndex } from './types';

export interface ILayersSearchResult {
  /** Rows whose text matches */
  matches: ReadonlySet<string>;
  /** Matches plus all their ancestors: the rows to draw */
  visible: ReadonlySet<string>;
}

const textOf = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Case-insensitive match on label, component name, property name and type (pane rows: their title). Undefined for a blank query */
export const searchLayers = (index: ILayersIndex, markup: IFlatComponentsStructure, getDefinition: FormDesignerComponentGetter, query: string): ILayersSearchResult | undefined => {
  const needle = query.trim().toLowerCase();
  if (needle === '')
    return undefined;

  const matches = new Set<string>();
  const visible = new Set<string>();
  index.nodes.forEach((node) => {
    const component = markup.allComponents[node.id];
    const texts = node.kind === 'component' && isConfigurableFormComponent(component)
      ? [getLayerLabel(node, markup, getDefinition), textOf(component.componentName), textOf(component.propertyName), component.type]
      : [getLayerLabel(node, markup, getDefinition)];
    if (!texts.some((text) => text.toLowerCase().includes(needle)))
      return;

    matches.add(node.id);
    let current: string | null = node.id;
    while (current !== null && !visible.has(current)) {
      visible.add(current);
      current = index.nodes.get(current)?.parentId ?? null;
    }
  });
  return { matches, visible };
};
