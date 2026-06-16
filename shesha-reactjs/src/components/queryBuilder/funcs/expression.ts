import { Func, JsonLogicFormatFunc, JsonLogicImportFunc, JsonLogicTree, RuleValue } from '@react-awesome-query-builder/antd';
import { getEvaluationNodeFromJsonLogicNode, IEvaluateJsonLogicNode } from '@/utils/jsonLogic';
import { IHasHideForCompare } from '../interfaces';
import { isDefined } from '@/utils/nullables';

const args2JsonLogic: JsonLogicFormatFunc = (funcArgs: Record<string, unknown>): JsonLogicTree => {
  const expressionRaw = funcArgs['expression'];
  const node: IEvaluateJsonLogicNode = {
    evaluate: [
      { expression: typeof (expressionRaw) === 'string' ? expressionRaw : "", type: 'javascript' },
    ],
  };

  return node;
};

const jsonLogic2Args: JsonLogicImportFunc = (val: unknown): RuleValue[] => {
  const node = typeof (val) === "object" && isDefined(val)
    ? getEvaluationNodeFromJsonLogicNode(val)
    : undefined;

  if (!node || node.evaluate.type !== 'javascript')
    throw `Can't parse 'expression' function`; // throw exception to skip current function and try to parse others

  return [node.evaluate.expression];
};

export const expressionFunc: Func & IHasHideForCompare & { defaultValue?: boolean } = {
  returnType: 'strict-boolean',
  hideForCompare: true,
  label: 'Evaluate (JavaScript)',
  defaultValue: true,
  jsonLogic: args2JsonLogic,
  jsonLogicImport: jsonLogic2Args,
  renderBrackets: [],
  args: {
    expression: {
      label: "Expression",
      type: 'javascript',
      preferWidgets: ['javascript'],
      widgets: {
        javascript: {

        },
      },
      defaultValue: '',
      valueSources: ['value'],
    },
  },
};
