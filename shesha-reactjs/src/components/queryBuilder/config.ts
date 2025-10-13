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
import { expressionFunc } from './funcs/expression';
import { JavaScriptWidget } from './widgets/javascript/index';
import { FieldWidget } from './widgets/field';

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

const standardSourceTypes: ValueSource[] = ['value', 'field', 'func'];

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
    valueSources: standardSourceTypes,
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
      'is_empty',
      'is_not_empty',
      'like',
      'not_like',
      'starts_with',
      'ends_with',
    ],
  },
  javascript: {
    valueSources: ['value'],
    operators: [
      'equal',
      'not_equal',
      'is_empty',
      'is_not_empty',
    ],
  },
};

for (const typeName in typeModifiers) {
  if (typeModifiers.hasOwnProperty(typeName)) {
    modifyType(types, typeName, typeModifiers[typeName]);
  }
};

// remove proximity search
delete standardOperators.proximity;

const operators = {
  ...standardOperators,
  starts_with: {
    ...standardOperators.starts_with,
    jsonLogic: 'startsWith',
  },
  ends_with: {
    ...standardOperators.ends_with,
    jsonLogic: 'endsWith',
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
  entityAutocomplete: EntityAutocompleteWidget,
  refListDropdown: RefListDropdownWidget,
  datetime: customDatetimeWidget,
  date: custonDateWidget,
  specification: SpecificationWidget,
  javascript: JavaScriptWidget,
  field: FieldWidget,
};

const evaluateTypes = ['boolean', 'date', 'datetime', 'time', 'number', 'text', 'entityReference', 'refList'];
const evaluateFunctions = {};
evaluateTypes.forEach((type) => {
  evaluateFunctions[`evaluate_${type}`.toUpperCase()] = getEvaluateFunc(type);
});

const knownFuncNames = ['NOW', 'LOWER', 'NOW', 'UPPER', 'RELATIVE_DATETIME'];
const knownFuncs: Funcs = {};
knownFuncNames.forEach((funcName) => {
  if (Object.hasOwn(BasicFuncs, funcName))
  // if (BasicFuncs.hasOwnProperty(funcName))
    knownFuncs[funcName] = BasicFuncs[funcName];
});

const funcs: Funcs = {
  ...knownFuncs,
  ...evaluateFunctions,
  expressionFunc,
};

export const config: Config = {
  ...AntdConfig,
  types,
  funcs,
  operators,
  widgets,
};
