import { Func, JsonLogicFormatFunc, JsonLogicImportFunc, JsonLogicTree, JsonLogicValue, RuleValue } from '@react-awesome-query-builder/antd';
import { getEvaluationNodeFromJsonLogicNode, IEvaluateJsonLogicNode } from '@/utils/jsonLogic';
import { IHasHideForCompare } from '../interfaces';

const args2JsonLogic: JsonLogicFormatFunc = (funcArgs: Record<string, JsonLogicValue>): JsonLogicTree => {
  const node: IEvaluateJsonLogicNode = {
    evaluate: [
      { expression: funcArgs.expression, type: 'javascript' },
    ],
  };

  return node;
};

const jsonLogic2Args: JsonLogicImportFunc = (val): RuleValue[] => {
  const node = getEvaluationNodeFromJsonLogicNode(val);
  if (!node || node.evaluate?.type !== 'javascript')
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
