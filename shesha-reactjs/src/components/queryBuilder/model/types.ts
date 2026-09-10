export type Conjunction = 'and' | 'or';

export type ValueSource = 'value' | 'field' | 'expression';

export type ExpressionLanguage = 'mustache' | 'javascript';

export type ScalarValue = string | number | boolean | null;

export interface ConstantValue {
  source: 'value';
  value?: ScalarValue | ScalarValue[] | undefined;
}

export interface FieldValue {
  source: 'field';
  path?: string | undefined;
}

export interface ExpressionValue {
  source: 'expression';
  language: ExpressionLanguage;
  expression: string;
  /** When false the rule is dropped at run time if the expression resolves to nothing. */
  required: boolean;
}

export type RuleValue = ConstantValue | FieldValue | ExpressionValue;

export interface RuleNode {
  kind: 'rule';
  id: string;
  /** Property path, or a specification name when the field kind is `specification`. */
  field?: string | undefined;
  operator?: string | undefined;
  values: RuleValue[];
}

export interface GroupNode {
  kind: 'group';
  id: string;
  conjunction: Conjunction;
  /** Imported from a negated group; not authorable in the UI. */
  not: boolean;
  children: QueryNode[];
}

/** JsonLogic the importer could not map. Kept verbatim so it survives a round trip. */
export interface RawRuleNode {
  kind: 'raw';
  id: string;
  json: object;
  reason: string;
}

export type QueryNode = GroupNode | RuleNode | RawRuleNode;

export type QueryTree = GroupNode;

export type DropPlacement = 'before' | 'after' | 'append';

export const isGroupNode = (node: QueryNode | undefined): node is GroupNode => node?.kind === 'group';
export const isRuleNode = (node: QueryNode | undefined): node is RuleNode => node?.kind === 'rule';
export const isRawRuleNode = (node: QueryNode | undefined): node is RawRuleNode => node?.kind === 'raw';
