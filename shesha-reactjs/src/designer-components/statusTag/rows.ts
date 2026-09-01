import { ILabelValue } from '@/components/dropdown/model';

/**
 * Marks the catch-all row, which had no code of its own. A flag rather than a reserved value: a
 * status whose value genuinely is `"default"` stays an ordinary row, and only a row carrying this
 * flag ever stands in for an unmatched value.
 */
export const DEFAULT_STATUS_FLAG = '_isDefaultStatus';

/** Carried through to the built option, so the renderer can find the catch-all among the rows. */
export interface IDefaultStatusMarker {
  [DEFAULT_STATUS_FLAG]?: boolean | undefined;
}

/**
 * A row as the Values editor stores it. `ILabelValue` with every field optional: the rows reach the
 * component from a JS setting, so nothing about their shape is guaranteed until it is checked.
 */
export type IStatusValueRow = Partial<ILabelValue<number | string>> & IDefaultStatusMarker;

/**
 * A row as the legacy Default Mappings table stored it. `code` is widened to accept the string the
 * catch-all row is given — the shared `IStatusMap` keeps its numeric `code` for the old renderer.
 */
export interface IStatusLegacyRow extends IDefaultStatusMarker {
  code?: number | string | undefined;
  text?: string | undefined;
  color?: string | undefined;
  override?: string | undefined;
}

/** Either shape, as they arrive mixed in one `values` array. */
export type IStatusRow = IStatusValueRow & IStatusLegacyRow;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOptional = (value: unknown, ...types: ('string' | 'number' | 'boolean')[]): boolean =>
  value === undefined || types.includes(typeof value as 'string' | 'number' | 'boolean');

/** True for a row carrying a usable `value`; `label`, `color` and the rest are checked with it. */
export const isStatusValueRow = (value: unknown): value is IStatusValueRow =>
  isRecord(value) &&
  value['value'] !== undefined &&
  isOptional(value['value'], 'string', 'number') &&
  isOptional(value['id'], 'string') &&
  isOptional(value['label'], 'string') &&
  isOptional(value['color'], 'string') &&
  isOptional(value['icon'], 'string') &&
  isOptional(value['description'], 'string');

/** True for a legacy row: no `value`, but a `code` standing in for it. */
export const isStatusLegacyRow = (value: unknown): value is IStatusLegacyRow =>
  isRecord(value) &&
  value['value'] === undefined &&
  value['code'] !== undefined &&
  isOptional(value['code'], 'string', 'number') &&
  isOptional(value['text'], 'string') &&
  isOptional(value['color'], 'string') &&
  isOptional(value['override'], 'string');

/** The catch-all row, whichever shape it was written in. */
export const isDefaultStatusRow = (row: IDefaultStatusMarker | null | undefined): boolean =>
  row?.[DEFAULT_STATUS_FLAG] === true;
