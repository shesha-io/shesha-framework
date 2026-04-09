import { FieldSettings, Func, JsonLogicFormatFunc, JsonLogicImportFunc, JsonLogicTree, JsonLogicValue, RuleValue } from '@react-awesome-query-builder/antd';
import { getEvaluationNodeFromJsonLogicNode, IEvaluateJsonLogicNode } from '@/utils/jsonLogic';
import { IHasHideForSelect } from '../interfaces';
import { ignoreIfUnassignedTooltip } from '../widgets/ignoreIfUnassigned/constants';

const args2JsonLogic: JsonLogicFormatFunc = (funcArgs: Record<string, JsonLogicValue>): JsonLogicTree => {
  const ignoreIfUnassigned = Boolean(funcArgs.ignoreIfUnassigned);
  const node: IEvaluateJsonLogicNode = {
    evaluate: [
      {
        expression: funcArgs.expression,
        required: !ignoreIfUnassigned,
        type: 'mustache',
      },
    ],
  };

  return node;
};

const jsonLogic2Args: JsonLogicImportFunc = (val): RuleValue[] => {
  const node = getEvaluationNodeFromJsonLogicNode(val);
  if (!node || (node.evaluate?.type !== 'mustache' && node.evaluate?.type !== 'javascript'))
    throw `Can't parse 'evaluate' function`; // throw exception to skip current function and try to parse others

  // Keep backward compatibility for legacy javascript evaluate nodes.
  const required = node.evaluate.type === 'javascript'
    ? true
    : node.evaluate.required === true;
  const ignoreIfUnassigned = !required;

  return [node.evaluate.expression, ignoreIfUnassigned];
};

type CustomFieldSettings = FieldSettings & {
  customProps: {
    checkedChildren?: string;
    unCheckedChildren?: string;
    title?: string;
  };
};

const requiredFieldSettings: CustomFieldSettings = {
  customProps: {
    title: ignoreIfUnassignedTooltip,
  },
};

export const getEvaluateFunc = (type: string): Func & IHasHideForSelect => {
  return {
    returnType: type,
    hideForSelect: true,
    label: 'Evaluate (mustache)',
    jsonLogic: args2JsonLogic,
    jsonLogicImport: jsonLogic2Args,
    renderBrackets: ['', ''],
    renderSeps: [''],
    args: {
      expression: {
        label: "Expression",
        type: 'text',
        defaultValue: '',
        valueSources: ['value'],
        widgets: {
          mustacheExpression: {
            operators: ['equal'],
          },
        },
        preferWidgets: ['mustacheExpression'],
      },
      ignoreIfUnassigned: {
        label: 'Ignore if unassigned',
        type: 'boolean',
        valueSources: ['value'],
        defaultValue: false,
        fieldSettings: requiredFieldSettings,
        widgets: {
          ignoreIfUnassigned: {
            operators: ['equal'],
          },
        },
        preferWidgets: ['ignoreIfUnassigned'],
      },
    },
  };
};
