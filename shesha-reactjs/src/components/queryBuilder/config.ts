import { Type, Config, BasicConfig, AntdConfig, Funcs, BasicFuncs, CoreTypes, ValueSource, DateTimeWidget } from '@react-awesome-query-builder/antd';
import EntityAutocompleteWidget from './widgets/entityAutocomplete';
import RefListDropdownWidget from './widgets/refListDropDown';
import moment from 'moment';
import { EntityReferenceType } from './types/entityReference';
import RefListType from './types/refList';
import { SpecificationWidget } from './widgets/specification';
import { SpecificationType } from './types/specification';
import { StrictBoolean } from './types/strictBoolean';
import { IDictionary } from '@/interfaces';
import { getEvaluateFunc } from './funcs/evaluate';
import GuidType from './types/guid';
import { JavaScriptWidget } from './widgets/javascript/index';
import { FieldWidget } from './widgets/field';
import { IgnoreIfUnassignedWidget } from './widgets/ignoreIfUnassigned';
import { ExpressionEditorWidget } from './widgets/mustacheExpression';
import { BooleanButtonSelectWidget } from './widgets/booleanButtonSelect';

interface TypeModifier extends Partial<Type> {
  operators?: string[];
};
const modifyType = (types: CoreTypes, typeName: string, modifier: TypeModifier): void => {
  const type: Type = types[typeName];
  if (type) {
    types[typeName] = { ...type, ...modifier };
  }
};

const basicConfig = BasicConfig;

const standardTypes = AntdConfig.types ?? basicConfig.types;
const standardOperators = AntdConfig.operators ?? basicConfig.operators;
const standardWidgets = AntdConfig.widgets ?? basicConfig.widgets;
const standardTextType = standardTypes.text;
const standardTextFieldWidget = standardTextType.widgets?.field;

const standardSourceTypes: ValueSource[] = ['value', 'field', 'func'];
const withoutValueTypes = <T extends object>(operator: T): T => {
  const nextOperator = { ...(operator as T & { valueTypes?: unknown }) };
  delete nextOperator.valueTypes;
  return nextOperator as T;
};

const types = {
  ...standardTypes,
  // non standard types
  "entityReference": EntityReferenceType,
  "refList": RefListType,
  "specification": SpecificationType,
  "strict-boolean": StrictBoolean,
  "guid": GuidType,
  "javascript": {
    ...standardTypes.text,
    defaultWidget: 'javascript',
    widgets: {
      javascript: {
        widgetProps: {},
        opProps: {},
      },
    },
  },
};

const typeModifiers: IDictionary<TypeModifier> = {
  boolean: {
    valueSources: ['value'],
  },
  date: {
    valueSources: standardSourceTypes,
  },
  datetime: {
    valueSources: standardSourceTypes,
  },
  time: {
    valueSources: standardSourceTypes,
  },
  number: {
    valueSources: standardSourceTypes,
  },
  text: {
    valueSources: standardSourceTypes,
    operators: [
      'equal',
      'not_equal',
      'is_null',
      'is_not_null',
      'like',
      'not_like',
      'starts_with',
      'ends_with',
    ],
    widgets: {
      ...standardTextType.widgets,
      field: {
        ...standardTextFieldWidget,
        operators: [
          'equal',
          'not_equal',
          'like',
          'not_like',
          'starts_with',
          'ends_with',
          'proximity',
        ],
      },
    },
  },
  javascript: {
    valueSources: ['value'],
    operators: [
      'equal',
      'not_equal',
      'is_null',
      'is_not_null',
    ],
  },
};

for (const typeName in typeModifiers) {
  if (typeModifiers.hasOwnProperty(typeName)) {
    modifyType(types, typeName, typeModifiers[typeName]);
  }
};

const { proximity: _proximity, ...operatorsWithoutProximity } = standardOperators;

const operators = {
  ...operatorsWithoutProximity,
  equal: {
    ...standardOperators.equal,
    label: 'is',
    labelForFormat: 'is',
  },
  not_equal: {
    ...standardOperators.not_equal,
    label: 'is not',
    labelForFormat: 'is not',
  },
  less: {
    ...standardOperators.less,
    label: 'is less than',
    labelForFormat: 'is less than',
  },
  less_or_equal: {
    ...standardOperators.less_or_equal,
    label: 'is less than or equal to',
    labelForFormat: 'is less than or equal to',
  },
  greater: {
    ...standardOperators.greater,
    label: 'is greater than',
    labelForFormat: 'is greater than',
  },
  greater_or_equal: {
    ...standardOperators.greater_or_equal,
    label: 'is greater than or equal to',
    labelForFormat: 'is greater than or equal to',
  },
  like: {
    ...withoutValueTypes(standardOperators.like),
    label: 'contains',
    labelForFormat: 'contains',
    valueSources: standardSourceTypes,
  },
  not_like: {
    ...withoutValueTypes(standardOperators.not_like),
    label: 'does not contain',
    labelForFormat: 'does not contain',
    valueSources: standardSourceTypes,
  },
  starts_with: {
    ...standardOperators.starts_with,
    label: 'starts with',
    labelForFormat: 'starts with',
    jsonLogic: 'startsWith',
  },
  ends_with: {
    ...standardOperators.ends_with,
    label: 'ends with',
    labelForFormat: 'ends with',
    jsonLogic: 'endsWith',
  },
  is_null: {
    ...standardOperators.is_null,
    label: 'is empty',
    labelForFormat: 'is empty',
  },
  is_not_null: {
    ...standardOperators.is_not_null,
    label: 'is not empty',
    labelForFormat: 'is not empty',
  },
  some: {
    ...standardOperators.some,
    label: 'Any of the following are true...',
    labelForFormat: 'Any of the following are true...',
  },
  all: {
    ...standardOperators.all,
    label: 'All of the following are true...',
    labelForFormat: 'All of the following are true...',
  },
  none: {
    ...standardOperators.none,
    label: 'None of the following are true...',
    labelForFormat: 'None of the following are true...',
  },
  is_satisfied: {
    label: 'Is satisfied',
    jsonLogic: 'is_satisfied',
    cardinality: 0,
  },
  is_satisfied_conditional: {
    label: 'Is satisfied when',
    jsonLogic: 'is_satisfied',
    cardinality: 1,
  },
};

const customDatetimeWidget: DateTimeWidget<Config> = {
  ...standardWidgets.datetime,
  timeFormat: 'HH:mm',
  jsonLogic: (val, _, wgtDef): string => {
    return moment(val, (wgtDef as DateTimeWidget<Config>).valueFormat).format();
  },
};
const custonDateWidget: DateTimeWidget<Config> = {
  ...standardWidgets.date,
  jsonLogic: (val, _, wgtDef): string => {
    return moment(val, (wgtDef as DateTimeWidget<Config>).valueFormat).format();
  },
};

const widgets = {
  ...standardWidgets,
  boolean: BooleanButtonSelectWidget,
  entityAutocomplete: EntityAutocompleteWidget,
  refListDropdown: RefListDropdownWidget,
  datetime: customDatetimeWidget,
  date: custonDateWidget,
  specification: SpecificationWidget,
  javascript: JavaScriptWidget,
  mustacheExpression: ExpressionEditorWidget,
  expressionEditor: ExpressionEditorWidget,
  field: FieldWidget,
  ignoreIfUnassigned: IgnoreIfUnassignedWidget,
};

const evaluateTypes = ['boolean', 'date', 'datetime', 'time', 'number', 'text', 'guid', 'entityReference', 'refList'];
const evaluateFunctions = {};
evaluateTypes.forEach((type) => {
  evaluateFunctions[`evaluate_${type}`.toUpperCase()] = getEvaluateFunc(type);
});

const knownFuncNames = ['NOW', 'RELATIVE_DATETIME'];
const knownFuncs: Funcs = {};
knownFuncNames.forEach((funcName) => {
  if (Object.hasOwn(BasicFuncs, funcName))
    knownFuncs[funcName] = BasicFuncs[funcName];
});

const funcs: Funcs = {
  ...knownFuncs,
  ...evaluateFunctions,
};

export const config: Config = {
  ...AntdConfig,
  types,
  funcs,
  operators,
  widgets,
};
