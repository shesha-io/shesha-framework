import {
  Config,
  FactoryWithContext,
  FieldConfig,
  FieldValue,
  Func,
  FuncArg,
  Operator,
  Utils as QbUtils,
  ValueSource,
  Widget,
  WidgetProps,
} from '@react-awesome-query-builder/antd';
import { ReactNode } from 'react';
import { isDefined } from '@/utils/nullables';

const { ConfigUtils } = QbUtils;

const isNonEmpty = (value?: string): value is string => isDefined(value) && value.length > 0;

/** A field is either a path string or, when the left-hand side is a function, a `FuncValue`. */
const hasField = (field?: FieldValue): field is FieldValue =>
  isDefined(field) && (typeof field !== 'string' || field.length > 0);

export const getFieldConfig = (config: Config, field?: FieldValue): FieldConfig | null =>
  hasField(field) ? ConfigUtils.getFieldConfig(config, field) : null;

export const isFuncConfig = (fieldConfig: FieldConfig | null): fieldConfig is Func =>
  isDefined(fieldConfig) && 'returnType' in fieldConfig;

export const getFieldType = (fieldConfig: FieldConfig | null): string | undefined => {
  if (!isDefined(fieldConfig))
    return undefined;

  return isFuncConfig(fieldConfig) ? fieldConfig.returnType : fieldConfig.type;
};

export const getTypeOperators = (config: Config, typeName?: string): string[] => {
  const typeDefinition = isNonEmpty(typeName) ? config.types[typeName] : undefined;
  if (!isDefined(typeDefinition))
    return [];

  const mainWidgetKey = typeDefinition.mainWidget;
  const mainWidgetOperators = isNonEmpty(mainWidgetKey) ? typeDefinition.widgets[mainWidgetKey]?.operators : undefined;
  const operators = Array.isArray(mainWidgetOperators) && mainWidgetOperators.length > 0
    ? mainWidgetOperators
    : Object.values(typeDefinition.widgets).flatMap((widgetConfig) => widgetConfig.operators ?? []);

  const excluded = typeDefinition.excludeOperators ?? [];
  return Array.from(new Set(operators)).filter((operator) => !excluded.includes(operator));
};

export const getFieldOperators = (config: Config, field?: FieldValue): string[] => {
  const fieldConfig = getFieldConfig(config, field);
  if (!isDefined(fieldConfig))
    return [];

  if (!isFuncConfig(fieldConfig) && Array.isArray(fieldConfig.operators) && fieldConfig.operators.length > 0)
    return fieldConfig.operators;

  return getTypeOperators(config, getFieldType(fieldConfig));
};

export const getOperatorConfig = (config: Config, operator?: string, field?: FieldValue): Operator | null =>
  isNonEmpty(operator) ? ConfigUtils.getOperatorConfig(config, operator, field) : null;

export const getOperatorCardinality = (config: Config, operator?: string, field?: FieldValue): number => {
  const operatorConfig = getOperatorConfig(config, operator, field);
  return typeof operatorConfig?.cardinality === 'number' ? operatorConfig.cardinality : 1;
};

export const getFuncConfig = (config: Config, func?: string): Func | null =>
  isNonEmpty(func) ? ConfigUtils.getFuncConfig(config, func) : null;

export const getFuncArgConfig = (config: Config, func: string, arg: string): FuncArg | null =>
  ConfigUtils.getFuncArgConfig(config, func, arg);

export interface IFuncCandidate {
  key: string;
  label: string;
  /** `hideForSelect` funcs stay out of the dropdown but remain usable as the implicit default. */
  hidden: boolean;
}

/** Applies the same `returnType` filtering RAQB's own FuncSelect does, keeping hidden funcs flagged. */
export const getFuncCandidates = (config: Config, expectedType?: string): IFuncCandidate[] => {
  const candidates: IFuncCandidate[] = [];

  for (const [funcPath, funcConfig] of ConfigUtils.iterateFuncs(config)) {
    if (isNonEmpty(expectedType) && funcConfig.returnType !== expectedType)
      continue;

    candidates.push({
      key: funcPath,
      label: funcConfig.label ?? funcPath,
      hidden: funcConfig.hideForSelect === true,
    });
  }

  return candidates;
};

export const getArgWidgetConfig = (config: Config, arg: FuncArg): Widget | null => {
  const preferred = arg.preferWidgets?.find((widgetKey) => isDefined(config.widgets[widgetKey]));
  if (isNonEmpty(preferred))
    return config.widgets[preferred] ?? null;

  const typeDefinition = config.types[arg.type];
  if (!isDefined(typeDefinition))
    return null;

  const widgetKey = typeDefinition.mainWidget ?? Object.keys(typeDefinition.widgets)[0];
  return isNonEmpty(widgetKey) ? config.widgets[widgetKey] ?? null : null;
};

export const getWidgetConfig = (
  config: Config,
  field?: FieldValue,
  operator?: string,
  valueSrc?: ValueSource,
): Widget | null => {
  if (!hasField(field) || !isNonEmpty(operator))
    return null;

  return ConfigUtils.getFieldWidgetConfig(config, field, operator, undefined, valueSrc);
};

/**
 * `WidgetProps` describes the immutable tree and a plain field, but this renderer walks the plain
 * tree and may carry a function on the left-hand side. Widgets only ever read `fieldSettings`, which
 * both `Field` and `Func` declare, so the two shapes are adapted here rather than at every call site.
 */
export const toWidgetField = (field: FieldValue): WidgetProps['field'] =>
  field as WidgetProps['field'];

export const toWidgetFieldDefinition = (fieldConfig: FieldConfig | null): WidgetProps['fieldDefinition'] =>
  fieldConfig as WidgetProps['fieldDefinition'];

/**
 * Each widget narrows `WidgetProps` to its own variant, so the union's factories share no callable
 * signature. RAQB dispatches on the widget it resolved, so the props always match at runtime; this is
 * the single boundary where that is asserted. Factories declare `this: ConfigContext` and must be
 * invoked bound to `config.ctx`.
 */
export const renderWidget = (widget: Widget | null, props: WidgetProps, ctx: Config['ctx']): ReactNode => {
  const factory = widget?.factory as FactoryWithContext<WidgetProps> | undefined;
  if (typeof factory !== 'function')
    return null;

  return factory.call(ctx, props, ctx);
};
