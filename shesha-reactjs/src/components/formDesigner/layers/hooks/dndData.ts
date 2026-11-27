import type { Input } from '@atlaskit/pragmatic-drag-and-drop/types';
import { isDefined } from '@/utils/nullables';
import { DropResolution, LayerDropInstruction } from '../model/dropTarget';

export const LAYER_SOURCE_KEY = 'shaLayerSourceId';
const DROP_DATA_KEY = 'shaLayerDrop';

/** What a row shows while something is dragged over it, and what a drop there would do */
export interface IRowDropState {
  instruction: LayerDropInstruction;
  resolution: DropResolution;
}

/** Stable callbacks the rows use; they read the panel's latest state */
export interface ILayersDndContext {
  canDrag: (rowId: string) => boolean;
  getRowDropData: (rowId: string, input: Input, element: Element, sourceId: string | undefined) => Record<string | symbol, unknown>;
  isCollapsedParent: (rowId: string) => boolean;
  expandRow: (rowId: string) => void;
}

export const isLayerSource = (data: Record<string, unknown>): boolean => typeof data[LAYER_SOURCE_KEY] === 'string';

export const getLayerSourceId = (data: Record<string, unknown>): string | undefined => {
  const value = data[LAYER_SOURCE_KEY];
  return typeof value === 'string' ? value : undefined;
};

export const makeDropData = (drop: IRowDropState): Record<string | symbol, unknown> => ({ [DROP_DATA_KEY]: drop });

const isRowDropState = (value: unknown): value is IRowDropState =>
  isDefined(value) && typeof value === 'object' && 'instruction' in value && 'resolution' in value;

export const getDropData = (data: Record<string | symbol, unknown>): IRowDropState | null => {
  const value = data[DROP_DATA_KEY];
  return isRowDropState(value) ? value : null;
};

const describeState = (state: IRowDropState | null): string =>
  state === null ? '' : JSON.stringify([state.instruction, state.resolution]);

/** Rows only re-render when what they show actually changes */
export const isSameDropState = (a: IRowDropState | null, b: IRowDropState | null): boolean => describeState(a) === describeState(b);
