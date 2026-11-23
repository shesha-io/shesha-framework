import { FieldKind } from './fields';
import { ExpressionLanguage, ValueSource } from '../model/types';

export type OperatorCardinality = 0 | 1 | 2;

export interface OperatorDef {
  key: string;
  label: string;
  cardinality: OperatorCardinality;
  kinds: FieldKind[];
  sources: ValueSource[];
  /** The single value is a list of scalars. */
  list?: boolean;
  /** Fixes the expression language for expression-sourced values. */
  expressionLanguage?: ExpressionLanguage;
}

const COMPARABLE: FieldKind[] = ['number', 'date', 'datetime', 'time'];
const ALL_SOURCES: ValueSource[] = ['value', 'field', 'expression'];
const VALUE_ONLY: ValueSource[] = ['value'];

/** The only place that says which operators exist and for which field kinds. Emitters and importers key on `key`. */
export const OPERATORS: OperatorDef[] = [
  { key: 'is', label: 'is', cardinality: 1, kinds: ['text', 'number', 'date', 'datetime', 'time', 'boolean', 'refList', 'entityReference', 'guid', 'unknown'], sources: ALL_SOURCES },
  { key: 'is_not', label: 'is not', cardinality: 1, kinds: ['text', 'number', 'date', 'datetime', 'time', 'boolean', 'refList', 'entityReference', 'guid', 'unknown'], sources: ALL_SOURCES },
  { key: 'is_empty', label: 'is empty', cardinality: 0, kinds: ['text', 'guid', 'entityReference', 'refList', 'unknown'], sources: VALUE_ONLY },
  { key: 'is_not_empty', label: 'is not empty', cardinality: 0, kinds: ['text', 'guid', 'entityReference', 'refList', 'unknown'], sources: VALUE_ONLY },
  { key: 'is_null', label: 'is null', cardinality: 0, kinds: ['number', 'date', 'datetime', 'time', 'boolean'], sources: VALUE_ONLY },
  { key: 'is_not_null', label: 'is not null', cardinality: 0, kinds: ['number', 'date', 'datetime', 'time', 'boolean'], sources: VALUE_ONLY },
  { key: 'contains', label: 'contains', cardinality: 1, kinds: ['text'], sources: ALL_SOURCES },
  { key: 'not_contains', label: 'does not contain', cardinality: 1, kinds: ['text'], sources: ALL_SOURCES },
  { key: 'starts_with', label: 'starts with', cardinality: 1, kinds: ['text'], sources: ALL_SOURCES },
  { key: 'ends_with', label: 'ends with', cardinality: 1, kinds: ['text'], sources: ALL_SOURCES },
  { key: 'greater', label: 'is greater than', cardinality: 1, kinds: COMPARABLE, sources: ALL_SOURCES },
  { key: 'greater_or_equal', label: 'is at least', cardinality: 1, kinds: COMPARABLE, sources: ALL_SOURCES },
  { key: 'less', label: 'is less than', cardinality: 1, kinds: COMPARABLE, sources: ALL_SOURCES },
  { key: 'less_or_equal', label: 'is at most', cardinality: 1, kinds: COMPARABLE, sources: ALL_SOURCES },
  { key: 'between', label: 'is between', cardinality: 2, kinds: COMPARABLE, sources: ALL_SOURCES },
  { key: 'any_of', label: 'is any of', cardinality: 1, kinds: ['refList', 'entityReference', 'text', 'number'], sources: VALUE_ONLY, list: true },
  { key: 'none_of', label: 'is none of', cardinality: 1, kinds: ['refList', 'entityReference', 'text', 'number'], sources: VALUE_ONLY, list: true },
  { key: 'is_satisfied', label: 'is satisfied', cardinality: 0, kinds: ['specification'], sources: VALUE_ONLY },
  { key: 'is_satisfied_when', label: 'is satisfied when', cardinality: 1, kinds: ['specification'], sources: ['expression'], expressionLanguage: 'javascript' },
];

const byKey = new Map(OPERATORS.map((op) => [op.key, op]));

export const getOperator = (key: string | undefined): OperatorDef | undefined => key === undefined ? undefined : byKey.get(key);

export const getOperatorsForKind = (kind: FieldKind | undefined): OperatorDef[] =>
  OPERATORS.filter((op) => op.kinds.includes(kind ?? 'unknown'));

export const getDefaultOperator = (kind: FieldKind | undefined): OperatorDef | undefined => getOperatorsForKind(kind)[0];

export const getOperatorCardinality = (key: string | undefined): OperatorCardinality => getOperator(key)?.cardinality ?? 0;
