import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { isDefined } from '@/utils/nullables';
import { getOperator } from '../catalogue/operators';
import { GroupNode, isGroupNode, isRawRuleNode, QueryNode, QueryTree, RuleNode, RuleValue } from '../model/types';

type Logic = Record<string, unknown>;

const varNode = (path: string): Logic => ({ var: path });

/** A value that cannot be serialised yet (nothing entered) makes its rule incomplete, and incomplete rules are not saved. */
const exportValue = (value: RuleValue | undefined): unknown | undefined => {
  if (!value) return undefined;
  switch (value.source) {
    case 'field':
      return isDefined(value.path) && value.path !== '' ? varNode(value.path) : undefined;
    case 'expression':
      return value.expression === ''
        ? undefined
        : { evaluate: [{ expression: value.expression, type: value.language, required: value.required }] };
    default:
      return value.value;
  }
};

const exportRule = (rule: RuleNode): Logic | undefined => {
  const def = getOperator(rule.operator);
  if (!def || !isDefined(rule.field) || rule.field === '') return undefined;
  const field = varNode(rule.field);
  const values = rule.values.slice(0, def.cardinality).map(exportValue);
  if (values.length < def.cardinality || values.some((v) => v === undefined)) return undefined;
  const [a, b] = values;

  switch (def.key) {
    case 'is': return { '==': [field, a] };
    case 'is_not': return { '!=': [field, a] };
    case 'is_empty': return { '!': field };
    case 'is_not_empty': return { '!!': field };
    case 'is_null': return { '==': [field, null] };
    case 'is_not_null': return { '!=': [field, null] };
    case 'contains': return { in: [a, field] };
    case 'not_contains': return { '!': { in: [a, field] } };
    case 'starts_with': return { startsWith: [field, a] };
    case 'ends_with': return { endsWith: [field, a] };
    case 'greater': return { '>': [field, a] };
    case 'greater_or_equal': return { '>=': [field, a] };
    case 'less': return { '<': [field, a] };
    case 'less_or_equal': return { '<=': [field, a] };
    case 'between': return { '<=': [a, field, b] };
    case 'any_of': return { in: [field, Array.isArray(a) ? a : [a]] };
    case 'none_of': return { '!': { in: [field, Array.isArray(a) ? a : [a]] } };
    case 'is_satisfied': return { is_satisfied: field };
    case 'is_satisfied_when': {
      // the backend takes the condition as a raw JavaScript string, not as an evaluate node
      const value = rule.values[0];
      return value?.source === 'expression' ? { is_satisfied: [field, value.expression] } : undefined;
    }
    default:
      return undefined;
  }
};

const exportNode = (node: QueryNode): unknown => {
  if (isRawRuleNode(node)) return node.json;
  if (isGroupNode(node)) return exportGroup(node);
  return exportRule(node);
};

const exportGroup = (group: GroupNode): Logic | undefined => {
  const children = group.children.map(exportNode).filter((child) => child !== undefined);
  if (children.length === 0) return undefined;
  const body: Logic = { [group.conjunction]: children };
  return group.not ? { '!': body } : body;
};

/** Serialises the model to the JsonLogic the backend parses. Incomplete rules are left out; an empty tree is `undefined`. */
export const exportToJsonLogic = (tree: QueryTree): JsonLogicFilter | undefined => exportGroup(tree) as JsonLogicFilter | undefined;
