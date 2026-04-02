import React from 'react';
import classNames from 'classnames';
import {
  Button,
  Checkbox,
  Select,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  DoubleRightOutlined,
  FolderOutlined,
  HolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  BuilderProps,
  Config,
  FieldProps,
  FieldSource,
  RuleValue,
  Utils as QbUtils,
  ValueSource,
  WidgetProps,
} from '@react-awesome-query-builder/antd';
import { FieldAutocomplete } from '../fieldAutocomplete';
import { SourceSelector } from '../sourceSelector';
import { getRootLogicLabel, IPlainTreeNode } from '../treeRelations';
import { ignoreIfUnassignedTooltip } from '../widgets/ignoreIfUnassigned/constants';
import { FieldWidgetProvider } from '../widgets/field/fieldWidgetContext';

type RelationValue = 'AND' | 'OR';
type DropPlacement = 'before' | 'after' | 'append';

interface IPlainRuleProperties {
  field?: string;
  fieldSrc?: FieldSource;
  fieldType?: string;
  operator?: string;
  value?: RuleValue[];
  valueSrc?: ValueSource[];
  valueType?: string[];
  valueError?: Array<string | null>;
  __relation?: RelationValue;
}

interface IPlainGroupProperties {
  conjunction?: RelationValue;
  __relation?: RelationValue;
}

type IPlainTreeItemProperties = Record<string, unknown> & IPlainRuleProperties & IPlainGroupProperties;

interface IPlainTreeItem extends Omit<IPlainTreeNode, 'children1' | 'properties' | 'type'> {
  id: string;
  type: 'group' | 'rule';
  children1?: IPlainTreeItem[];
  properties?: IPlainTreeItemProperties;
}

interface IDropHint {
  path: string[];
  placement: DropPlacement;
}

interface IBuilderItemCommonProps {
  config: Config;
  actions: BuilderProps['actions'];
  tree: BuilderProps['tree'];
  readOnly: boolean;
  dragState: string[] | null;
  dropHint: IDropHint | null;
  onStartDrag: (path: string[]) => React.DragEventHandler<HTMLButtonElement>;
  onFinishDrag: React.DragEventHandler<HTMLButtonElement>;
  onDragOverItem: (path: string[]) => React.DragEventHandler<HTMLDivElement>;
  onDropOnItem: (path: string[]) => React.DragEventHandler<HTMLDivElement>;
  onDragLeaveItem: React.DragEventHandler<HTMLDivElement>;
  onDragOverAppend: (path: string[]) => React.DragEventHandler<HTMLDivElement>;
  onDropAppend: (path: string[]) => React.DragEventHandler<HTMLDivElement>;
}

interface IBuilderItemProps extends IBuilderItemCommonProps {
  node: IPlainTreeItem;
  parentNode: IPlainTreeItem;
  path: string[];
  index: number;
}

interface IGroupProps extends IBuilderItemCommonProps {
  canDelete: boolean;
  canDrag: boolean;
  node: IPlainTreeItem;
  path: string[];
  isRoot: boolean;
}

interface IRuleProps {
  node: IPlainTreeItem;
  path: string[];
  config: Config;
  actions: BuilderProps['actions'];
  readOnly: boolean;
}

const DEFAULT_SOURCE_LABELS: Record<string, string> = {
  field: 'Field',
  func: 'Function',
  value: 'Value',
};

const RELATION_OPTIONS: RelationValue[] = ['AND', 'OR'];
const FIELD_SOURCE_ITEMS: Array<[string, { label: string }]> = [
  ['field', { label: 'Field' }],
  ['func', { label: 'Function' }],
];


const isGroupNode = (node?: IPlainTreeItem): boolean => node?.type === 'group';

const getChildren = (node?: IPlainTreeItem): IPlainTreeItem[] => Array.isArray(node?.children1) ? node.children1 : [];

const getRelationOptions = (config: Config): Array<{ label: string; value: RelationValue }> => {
  return RELATION_OPTIONS.map((value) => ({
    value,
    label: config.conjunctions?.[value]?.label ?? value,
  }));
};

const getDefaultConjunction = (config: Config): RelationValue => {
  const configured = config.settings?.defaultConjunction;
  return configured === 'OR' ? 'OR' : 'AND';
};

const getSelectedRelation = (node: IPlainTreeItem, parentNode: IPlainTreeItem, config: Config): RelationValue => {
  const relation = node.properties?.__relation;
  if (relation === 'OR')
    return 'OR';

  const parentConjunction = parentNode.properties?.conjunction;
  if (parentConjunction === 'OR')
    return 'OR';

  return getDefaultConjunction(config);
};

const getImmutablePath = (path: string[]): Array<string | number> => {
  const treePath: Array<string | number> = [];
  for (let index = 1; index < path.length; index += 1) {
    treePath.push('children1', path[index]);
  }

  return treePath;
};

const getPathKey = (path: string[]): string => path.join('/');

const isPathPrefix = (prefix: string[], target: string[]): boolean => {
  if (prefix.length > target.length)
    return false;

  return prefix.every((segment, index) => target[index] === segment);
};

const getSourceLabel = (config: Config, source: string): string => {
  const valueSourcesInfo = (config.settings as Config['settings'] & {
    valueSourcesInfo?: Record<string, { label?: string } | string>;
  })?.valueSourcesInfo;
  const sourceInfo = valueSourcesInfo?.[source];

  if (typeof sourceInfo === 'string')
    return sourceInfo;

  return sourceInfo?.label ?? DEFAULT_SOURCE_LABELS[source] ?? source;
};

const getValueSourceItems = (config: Config, sources: ValueSource[]): Array<[string, { label: string }]> => {
  return sources.map((source) => [source, { label: getSourceLabel(config, source) }]);
};

type IOperatorAwareFieldDefinition = {
  type?: string;
  returnType?: string;
  operators?: string[];
};

const getFallbackOperatorsForType = (config: Config, typeName?: string): string[] => {
  if (!typeName)
    return [];

  const typeDefinition = config.types?.[typeName] as { operators?: string[] } | undefined;
  return Array.isArray(typeDefinition?.operators) ? typeDefinition.operators : [];
};

const getOperatorOptions = (config: Config, field?: string): Array<{ label: string; value: string }> => {
  if (!field)
    return [];

  const fieldDefinition = QbUtils.ConfigUtils.getFieldConfig(config, field) as IOperatorAwareFieldDefinition | null | undefined;
  const configUtils = QbUtils.ConfigUtils as unknown as {
    getOperatorsForField?: (cfg: Config, fieldName: string) => string[] | null;
  };
  const operatorKeys = typeof configUtils.getOperatorsForField === 'function'
    ? (configUtils.getOperatorsForField(config, field) ?? [])
    : Array.isArray(fieldDefinition?.operators) && fieldDefinition.operators.length > 0
      ? fieldDefinition.operators
      : getFallbackOperatorsForType(config, fieldDefinition?.type ?? fieldDefinition?.returnType);

  return operatorKeys.map((value) => ({
    value,
    label: config.operators?.[value]?.label ?? value,
  }));
};

const getOperatorOptionsForType = (config: Config, typeName: string): Array<{ label: string; value: string }> => {
  const configUtils = QbUtils.ConfigUtils as unknown as {
    getOperatorsForType?: (cfg: Config, type: string) => string[] | null;
  };
  const operatorKeys = typeof configUtils.getOperatorsForType === 'function'
    ? (configUtils.getOperatorsForType(config, typeName) ?? [])
    : getFallbackOperatorsForType(config, typeName);

  return operatorKeys.map((value) => ({
    value,
    label: config.operators?.[value]?.label ?? value,
  }));
};

const getOperatorCardinality = (config: Config, operator?: string): number => {
  if (!operator)
    return 1;

  const operatorDefinition = config.operators?.[operator] as { cardinality?: number } | undefined;
  return typeof operatorDefinition?.cardinality === 'number' ? operatorDefinition.cardinality : 1;
};

type IValueSourceAwareFieldDefinition = {
  type?: string;
  returnType?: string;
  valueSources?: ValueSource[];
};

type IValueSourceAwareOperatorDefinition = {
  valueSources?: ValueSource[];
};

const getConfigValueSources = (config: Config): ValueSource[] => {
  const valueSourceKeys = Object.keys(config.settings?.valueSourcesInfo ?? {});
  return (valueSourceKeys.length > 0 ? valueSourceKeys : ['value']) as ValueSource[];
};

const getFallbackValueSources = (
  config: Config,
  fieldDefinition: IValueSourceAwareFieldDefinition | null | undefined,
  operator?: string,
): ValueSource[] => {
  const fieldType = fieldDefinition?.type ?? fieldDefinition?.returnType;
  const typeDefinition = fieldType ? (config.types?.[fieldType] as { valueSources?: ValueSource[] } | undefined) : undefined;
  const operatorDefinition = operator ? (config.operators?.[operator] as IValueSourceAwareOperatorDefinition | undefined) : undefined;

  const fieldValueSources = Array.isArray(fieldDefinition?.valueSources) && fieldDefinition.valueSources.length > 0
    ? fieldDefinition.valueSources
    : Array.isArray(typeDefinition?.valueSources) && typeDefinition.valueSources.length > 0
      ? typeDefinition.valueSources
      : getConfigValueSources(config);

  if (!Array.isArray(operatorDefinition?.valueSources) || operatorDefinition.valueSources.length === 0)
    return fieldValueSources;

  const filteredValueSources = fieldValueSources.filter((source) => operatorDefinition.valueSources.includes(source));
  return filteredValueSources.length > 0 ? filteredValueSources : ['value'];
};

const getValueSources = (config: Config, field?: string, operator?: string): ValueSource[] => {
  if (!field || !operator)
    return ['value'];

  const fieldDefinition = QbUtils.ConfigUtils.getFieldConfig(config, field);
  const configUtils = QbUtils.ConfigUtils as unknown as {
    getValueSourcesForFieldOp?: (cfg: Config, fieldName: string, operatorName: string, fieldDefinition?: unknown) => ValueSource[];
    filterValueSourcesForField?: (cfg: Config, valueSources: ValueSource[], fieldDefinition?: unknown, operatorName?: string | null) => ValueSource[];
  };
  const fallbackValueSources = getFallbackValueSources(
    config,
    fieldDefinition as IValueSourceAwareFieldDefinition | null | undefined,
    operator,
  );

  if (typeof configUtils.getValueSourcesForFieldOp === 'function')
    return configUtils.getValueSourcesForFieldOp(config, field, operator, fieldDefinition) ?? fallbackValueSources;

  if (typeof configUtils.filterValueSourcesForField === 'function')
    return configUtils.filterValueSourcesForField(config, fallbackValueSources, fieldDefinition, operator) ?? fallbackValueSources;

  return fallbackValueSources;
};

const getWidgetKey = (config: Config, field?: string, operator?: string, valueSrc?: ValueSource): string | null => {
  if (!field || !operator || !valueSrc)
    return null;

  const configUtils = QbUtils.ConfigUtils as unknown as {
    getWidgetForFieldOp?: (cfg: Config, fieldName: string, operatorName: string, valueSrc?: ValueSource | null) => string | null;
    getWidgetsForFieldOp?: (cfg: Config, fieldName: string, operatorName: string, valueSrc?: ValueSource | null) => string[] | null;
  };

  if (typeof configUtils.getWidgetForFieldOp === 'function')
    return configUtils.getWidgetForFieldOp(config, field, operator, valueSrc);

  const widgets = configUtils.getWidgetsForFieldOp?.(config, field, operator, valueSrc) ?? [];
  return widgets[0] ?? null;
};

const getFieldSourceReadonly = (config: Config, readOnly: boolean): boolean => {
  return readOnly || config.settings?.immutableFieldsMode === true;
};

const getOperatorReadonly = (config: Config, readOnly: boolean): boolean => {
  return readOnly || config.settings?.immutableOpsMode === true;
};

const getValueReadonly = (config: Config, readOnly: boolean): boolean => {
  return readOnly || config.settings?.immutableValuesMode === true;
};

const getGroupReadonly = (config: Config, readOnly: boolean): boolean => {
  return readOnly || config.settings?.immutableGroupsMode === true;
};

const getPrimitiveTitle = (value: RuleValue | undefined): string | undefined => {
  if (typeof value === 'string')
    return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);

  return undefined;
};

const getEvaluateFunctionName = (fieldType?: string): string => {
  return `EVALUATE_${fieldType ?? 'text'}`.toUpperCase();
};

const isBooleanFieldType = (fieldType?: string): boolean => fieldType === 'boolean' || fieldType === 'strict-boolean';

const createEvaluateFunctionValue = (fieldType: string | undefined, expression: string, ignoreIfUnassigned: boolean): unknown => {
  return QbUtils.TreeUtils.jsToImmutable({
    func: getEvaluateFunctionName(fieldType),
    args: {
      expression: {
        value: expression,
        valueSrc: 'value',
      },
      ignoreIfUnassigned: {
        value: ignoreIfUnassigned,
        valueSrc: 'value',
      },
    },
  });
};

const parseEvaluateFunctionValue = (value: RuleValue | undefined): { expression: string; ignoreIfUnassigned: boolean } => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { expression: '', ignoreIfUnassigned: false };

  const funcValue = value as {
    args?: {
      expression?: { value?: string };
      ignoreIfUnassigned?: { value?: boolean };
    };
  };

  return {
    expression: funcValue.args?.expression?.value ?? '',
    ignoreIfUnassigned: Boolean(funcValue.args?.ignoreIfUnassigned?.value),
  };
};

const stopPointerPropagation = (event: React.MouseEvent | React.PointerEvent): void => {
  event.stopPropagation();
};

const RelationPrefix: React.FC<{
  config: Config;
  isFirst: boolean;
  readOnly: boolean;
  value: RelationValue;
  onChange: (value: RelationValue) => void;
}> = ({ config, isFirst, onChange, readOnly, value }) => {
  if (isFirst)
    return <span className="sha-query-builder-prefix-label">Where</span>;

  return (
    <div
      className="sha-query-builder-prefix-select"
      onMouseDown={stopPointerPropagation}
      onPointerDown={stopPointerPropagation}
    >
      <Select
        value={value}
        options={getRelationOptions(config)}
        onChange={(nextValue) => onChange(nextValue as RelationValue)}
        variant="borderless"
        disabled={readOnly}
        popupMatchSelectWidth={false}
        size={config.settings?.renderSize === 'medium' ? 'middle' : config.settings?.renderSize}
      />
    </div>
  );
};

const QueryBuilderItemRail: React.FC<{
  canDelete: boolean;
  canDrag: boolean;
  isGroup: boolean;
  onDelete: () => void;
  onDragStart: React.DragEventHandler<HTMLButtonElement>;
  onDragEnd: React.DragEventHandler<HTMLButtonElement>;
}> = ({ canDelete, canDrag, isGroup, onDelete, onDragEnd, onDragStart }) => {
  return (
    <div className={classNames('sha-query-builder-item-rail', isGroup && 'is-group')}>
      <button
        type="button"
        className="sha-query-builder-rail-button"
        onClick={onDelete}
        disabled={!canDelete}
        aria-label="Delete"
        title="Delete"
      >
        <DeleteOutlined />
      </button>
      <button
        type="button"
        className="sha-query-builder-rail-button"
        draggable={canDrag}
        disabled={!canDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        aria-label="Drag"
        title="Drag"
      >
        <HolderOutlined />
      </button>
    </div>
  );
};

const RuleValueFieldEditor: React.FC<{
  config: Config;
  field: string;
  fieldType?: string;
  operator: string;
  path: string[];
  actions: BuilderProps['actions'];
  readOnly: boolean;
  value?: RuleValue;
}> = ({ actions, config, field, fieldType, operator, path, readOnly, value }) => {
  const widgetProps = React.useMemo(() => ({
    config,
    field,
    fieldDefinition: QbUtils.ConfigUtils.getFieldConfig(config, field) as unknown as WidgetProps['fieldDefinition'],
    fieldSrc: 'field' as FieldSource,
    fieldType,
    operator,
    value,
    readonly: readOnly,
  }), [config, field, fieldType, operator, readOnly, value]);

  const fieldProps = React.useMemo(() => ({
    items: [],
    config,
    placeholder: 'Select field',
    selectedFieldSrc: 'field' as FieldSource,
    selectedKey: typeof value === 'string' ? value : undefined,
    readonly: readOnly,
    setField: (nextField: string): void => {
      actions.setValue(path, 0, nextField as unknown as RuleValue, fieldType ?? 'text');
    },
  }), [actions, config, fieldType, path, readOnly, value]);

  return (
    <FieldWidgetProvider widgetProps={widgetProps as unknown as WidgetProps}>
      <FieldAutocomplete {...(fieldProps as unknown as FieldProps)} />
    </FieldWidgetProvider>
  );
};

const RuleWidgetEditor: React.FC<{
  actions: BuilderProps['actions'];
  config: Config;
  field: string;
  fieldType?: string;
  operator: string;
  path: string[];
  delta: number;
  readOnly: boolean;
  valueSrc: ValueSource;
  value?: RuleValue;
  valueType?: string;
  valueError?: string | null;
}> = ({
  actions,
  config,
  delta,
  field,
  fieldType,
  operator,
  path,
  readOnly,
  value,
  valueError,
  valueSrc,
  valueType,
}: {
  actions: BuilderProps['actions'];
  config: Config;
  field: string;
  fieldType?: string;
  operator: string;
  path: string[];
  delta: number;
  readOnly: boolean;
  valueSrc: ValueSource;
  value?: RuleValue;
  valueType?: string;
  valueError?: string | null;
}) => {
  if (valueSrc === 'field') {
    return (
      <RuleValueFieldEditor
        config={config}
        field={field}
        fieldType={fieldType}
        operator={operator}
        path={path}
        actions={actions}
        readOnly={readOnly}
        value={value}
      />
    );
  }

  const fieldDefinition = QbUtils.ConfigUtils.getFieldConfig(config, field);
  const widgetKey = getWidgetKey(config, field, operator, valueSrc);
  const widgetDefinition = widgetKey ? config.widgets?.[widgetKey] : undefined;
  const fieldConfigType = (fieldDefinition as { type?: string } | null)?.type;
  const fieldConfigLabel = (fieldDefinition as { label?: string } | null)?.label;
  const fieldConfigSettings = (fieldDefinition as unknown as { fieldSettings?: Record<string, unknown> } | null)?.fieldSettings;

  if (!widgetDefinition || typeof widgetDefinition.factory !== 'function') {
    return <div className="sha-query-builder-value-placeholder" />;
  }

  const widgetFactory = widgetDefinition.factory as unknown as (props: WidgetProps, ctx?: Config['ctx']) => React.ReactNode;
  const widgetType = (widgetDefinition as { type?: string }).type;
  const nextValueType = valueType ?? widgetType ?? fieldType ?? fieldConfigType ?? 'text';
  const placeholder = widgetDefinition.valuePlaceholder ?? (fieldConfigLabel ? `Enter ${fieldConfigLabel}` : 'Enter value');
  const widgetProps: WidgetProps = {
    ...(fieldConfigSettings ?? {}),
    placeholder,
    field: field as unknown as WidgetProps['field'],
    fieldDefinition: fieldDefinition as unknown as WidgetProps['fieldDefinition'],
    fieldSrc: 'field',
    fieldType,
    operator,
    config,
    delta,
    readonly: readOnly,
    value,
    valueError: valueError ?? undefined,
    errorMessage: valueError ?? undefined,
    setValue: (nextValue: RuleValue): void => {
      actions.setValue(path, delta, nextValue as unknown as RuleValue, nextValueType);
    },
  };

  return (
    <div className="sha-query-builder-widget-host" title={getPrimitiveTitle(value)}>
      {widgetFactory(widgetProps, config.ctx)}
    </div>
  );
};

const FunctionValueEditor: React.FC<{
  actions: BuilderProps['actions'];
  config: Config;
  field: string;
  fieldType?: string;
  operator: string;
  path: string[];
  readOnly: boolean;
  value?: RuleValue;
}> = ({ actions, config, field, fieldType, operator, path, readOnly, value }: {
  actions: BuilderProps['actions'];
  config: Config;
  field: string;
  fieldType?: string;
  operator: string;
  path: string[];
  readOnly: boolean;
  value?: RuleValue;
}) => {
  const currentValue = React.useMemo(() => parseEvaluateFunctionValue(value), [value]);
  const widgetDefinition = config.widgets?.mustacheExpression;
  const widgetFactory = typeof widgetDefinition?.factory === 'function'
    ? widgetDefinition.factory as unknown as (props: WidgetProps, ctx?: Config['ctx']) => React.ReactNode
    : null;

  const widgetProps: WidgetProps = {
    placeholder: 'Expression',
    field: field as unknown as WidgetProps['field'],
    fieldDefinition: QbUtils.ConfigUtils.getFieldConfig(config, field) as unknown as WidgetProps['fieldDefinition'],
    fieldSrc: 'field',
    fieldType,
    operator,
    config,
    readonly: readOnly,
    value: currentValue.expression,
    setValue: (nextValue: RuleValue): void => {
      actions.setValue(
        path,
        0,
        createEvaluateFunctionValue(fieldType, String(nextValue ?? ''), currentValue.ignoreIfUnassigned) as unknown as RuleValue,
        fieldType ?? 'text',
      );
    },
  };

  return (
    <>
      <div className="sha-query-builder-func-expression" title={currentValue.expression || 'Expression'}>
        {widgetFactory ? widgetFactory(widgetProps, config.ctx) : null}
      </div>
      <Tooltip title={ignoreIfUnassignedTooltip} placement="top">
        <div className="sha-query-builder-func-checkbox">
          <span
            className={classNames(
              'sha-query-builder-ignore-unassigned',
              currentValue.ignoreIfUnassigned && 'is-checked',
            )}
          >
            <Checkbox
              checked={currentValue.ignoreIfUnassigned}
              disabled={readOnly}
              onChange={(event) => {
                actions.setValue(
                  path,
                  0,
                  createEvaluateFunctionValue(fieldType, currentValue.expression, event.target.checked) as unknown as RuleValue,
                  fieldType ?? 'text',
                );
              }}
            />
            <DoubleRightOutlined className="sha-query-builder-ignore-unassigned-icon" />
          </span>
        </div>
      </Tooltip>
    </>
  );
};

/** Parse a field-side func expression value back into { expression, ignoreIfUnassigned }. */
const parseFieldFuncExpression = (field: unknown): { expression: string; ignoreIfUnassigned: boolean } => {
  if (!field || typeof field !== 'object')
    return { expression: '', ignoreIfUnassigned: false };

  // Field-side func is stored as an EVALUATE_TEXT func shape: { func, args: { expression, ignoreIfUnassigned } }
  const raw = field as unknown as {
    args?: {
      expression?: { value?: string };
      ignoreIfUnassigned?: { value?: boolean };
    };
  };
  return {
    expression: raw.args?.expression?.value ?? '',
    ignoreIfUnassigned: Boolean(raw.args?.ignoreIfUnassigned?.value),
  };
};

/** Build the field-side func value — same EVALUATE_TEXT shape used on the value side. */
const createFieldFuncExpression = (expression: string, ignoreIfUnassigned: boolean): unknown => {
  return QbUtils.TreeUtils.jsToImmutable({
    func: 'EVALUATE_TEXT',
    args: {
      expression: {
        value: expression,
        valueSrc: 'value',
      },
      ignoreIfUnassigned: {
        value: ignoreIfUnassigned,
        valueSrc: 'value',
      },
    },
  });
};

const FieldFunctionEditor: React.FC<{
  actions: BuilderProps['actions'];
  config: Config;
  path: string[];
  field: unknown;
  readOnly: boolean;
}> = ({ actions, config, field, path, readOnly }) => {
  const { expression, ignoreIfUnassigned } = React.useMemo(() => parseFieldFuncExpression(field), [field]);

  const widgetDefinition = config.widgets?.mustacheExpression;
  const widgetFactory = typeof widgetDefinition?.factory === 'function'
    ? widgetDefinition.factory as unknown as (props: WidgetProps, ctx?: Config['ctx']) => React.ReactNode
    : null;

  const widgetProps: WidgetProps = {
    placeholder: 'Expression',
    field: '' as unknown as WidgetProps['field'],
    fieldDefinition: null as unknown as WidgetProps['fieldDefinition'],
    fieldSrc: 'func',
    fieldType: 'text',
    operator: '',
    config,
    readonly: readOnly,
    value: expression,
    setValue: (nextValue: RuleValue): void => {
      actions.setField(
        path,
        createFieldFuncExpression(String(nextValue ?? ''), ignoreIfUnassigned) as never,
      );
    },
  };

  return (
    <>
      <div className="sha-query-builder-func-expression" title={expression || 'Expression'}>
        {widgetFactory ? widgetFactory(widgetProps, config.ctx) : null}
      </div>
      <Tooltip title={ignoreIfUnassignedTooltip} placement="top">
        <div className="sha-query-builder-func-checkbox">
          <span
            className={classNames(
              'sha-query-builder-ignore-unassigned',
              ignoreIfUnassigned && 'is-checked',
            )}
          >
            <Checkbox
              checked={ignoreIfUnassigned}
              disabled={readOnly}
              onChange={(event) => {
                actions.setField(
                  path,
                  createFieldFuncExpression(expression, event.target.checked) as never,
                );
              }}
            />
            <DoubleRightOutlined className="sha-query-builder-ignore-unassigned-icon" />
          </span>
        </div>
      </Tooltip>
    </>
  );
};

const RuleValueEditor: React.FC<{
  node: IPlainTreeItem;
  path: string[];
  config: Config;
  actions: BuilderProps['actions'];
  readOnly: boolean;
}> = ({ actions, config, node, path, readOnly }) => {
  const properties = (node.properties ?? {}) as IPlainRuleProperties;
  const selectedField = properties.field;
  const selectedOperator = properties.operator;
  const values = Array.isArray(properties.value) ? properties.value : [];
  const valueSrcs = Array.isArray(properties.valueSrc) ? properties.valueSrc : [];
  const valueTypes = Array.isArray(properties.valueType) ? properties.valueType : [];
  const valueErrors = Array.isArray(properties.valueError) ? properties.valueError : [];
  const fieldDefinition = selectedField ? QbUtils.ConfigUtils.getFieldConfig(config, selectedField) : null;
  const fieldType = properties.fieldType ?? (fieldDefinition as { type?: string } | null)?.type;
  const cardinality = getOperatorCardinality(config, selectedOperator);

  if (!selectedField || !selectedOperator) {
    return <div className="sha-query-builder-value-shell sha-query-builder-value-shell--empty" />;
  }

  if (cardinality === 0) {
    return null;
  }

  if (isBooleanFieldType(fieldType)) {
    return (
      <div className="sha-query-builder-boolean-value">
        <RuleWidgetEditor
          actions={actions}
          config={config}
          delta={0}
          field={selectedField}
          fieldType={fieldType}
          operator={selectedOperator}
          path={path}
          readOnly={getValueReadonly(config, readOnly)}
          value={values[0]}
          valueError={valueErrors[0]}
          valueSrc="value"
          valueType={valueTypes[0]}
        />
      </div>
    );
  }

  const availableSources = getValueSources(config, selectedField, selectedOperator);
  const currentSource = availableSources.includes(valueSrcs[0]) ? valueSrcs[0] : availableSources[0];
  const isFunction = currentSource === 'func' && cardinality === 1;
  const sourceItems = getValueSourceItems(config, availableSources);
  const valueReadonly = getValueReadonly(config, readOnly);

  const handleSourceChange = (nextSource: string): void => {
    if (nextSource === currentSource)
      return;

    for (let delta = 0; delta < cardinality; delta += 1) {
      actions.setValueSrc(path, delta, nextSource as ValueSource);
      actions.setValue(
        path,
        delta,
        undefined as unknown as RuleValue,
        valueTypes[delta] ?? fieldType ?? 'text',
      );
    }

    if (nextSource === 'func') {
      actions.setValue(
        path,
        0,
        createEvaluateFunctionValue(fieldType, '', false) as unknown as RuleValue,
        fieldType ?? 'text',
      );
    }
  };

  return (
    <div className={classNames('sha-query-builder-value-shell', isFunction && 'is-function')}>
      <div className="sha-query-builder-source-slot">
        <SourceSelector
          variant="value"
          valueSources={sourceItems}
          valueSrc={currentSource}
          setValueSrc={handleSourceChange}
          readonly={valueReadonly}
        />
      </div>
      {isFunction ? (
        <FunctionValueEditor
          config={config}
          field={selectedField}
          fieldType={fieldType}
          operator={selectedOperator}
          path={path}
          actions={actions}
          readOnly={valueReadonly}
          value={values[0]}
        />
      ) : (
        <div className={classNames('sha-query-builder-value-editor', cardinality > 1 && 'is-range')}>
          {Array.from({ length: cardinality }).map((_, delta) => {
            const deltaSource = availableSources.includes(valueSrcs[delta]) ? valueSrcs[delta] : currentSource;
            return (
              <div key={`${node.id}-${delta}`} className="sha-query-builder-value-editor-slot">
                <RuleWidgetEditor
                  actions={actions}
                  config={config}
                  delta={delta}
                  field={selectedField}
                  fieldType={fieldType}
                  operator={selectedOperator}
                  path={path}
                  readOnly={valueReadonly}
                  value={values[delta]}
                  valueError={valueErrors[delta]}
                  valueSrc={deltaSource}
                  valueType={valueTypes[delta]}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const QueryRuleRow: React.FC<IRuleProps> = (props) => {
  const {
    actions,
    config,
    node,
    path,
    readOnly,
  } = props;
  const properties = (node.properties ?? {}) as IPlainRuleProperties;
  const selectedField = properties.field;
  const selectedFieldSrc: FieldSource = properties.fieldSrc ?? 'field';
  const isFieldFunc = selectedFieldSrc === 'func';
  const selectedOperator = properties.operator;
  // When field side is a func, derive operators from the function return type (text for UPPER/LOWER).
  const operatorOptions = isFieldFunc
    ? getOperatorOptionsForType(config, 'text')
    : getOperatorOptions(config, selectedField);
  const fieldReadonly = getFieldSourceReadonly(config, readOnly);
  const operatorReadonly = getOperatorReadonly(config, readOnly);
  const activeOperatorLabel = operatorOptions.find((item) => item.value === selectedOperator)?.label;

  const handleFieldSrcChange = (nextSrc: string): void => {
    if (nextSrc === selectedFieldSrc)
      return;

    if (nextSrc === 'func') {
      (actions as unknown as { setFieldSrc: (path: string[], src: FieldSource) => void })
        .setFieldSrc(path, 'func');
      actions.setField(path, createFieldFuncExpression('', false) as never);
    } else {
      // Switching back to plain field — remove this rule and add a fresh empty one at the parent group.
      const parentPath = path.slice(0, -1);
      actions.removeRule(path);
      actions.addRule(parentPath);
    }
  };

  const fieldProps: FieldProps = {
    items: [],
    config,
    placeholder: config.settings?.fieldPlaceholder,
    selectedFieldSrc: 'field',
    selectedKey: selectedField,
    readonly: fieldReadonly,
    setField: (nextField: string): void => {
      actions.setField(path, nextField as never);
    },
  };

  // path.length === 2 is root-level; each nested group adds 1. Wrap layout at depth 3+.
  const isDeepNested = path.length >= 4;
  const isUnaryOperator = getOperatorCardinality(config, selectedOperator) === 0;

  return (
    <div className={classNames('sha-query-builder-rule-row', isFieldFunc && 'has-field-func', isDeepNested && 'is-deep-nested', isUnaryOperator && 'is-unary')}>
      <div
        className={classNames(
          isFieldFunc
            ? 'sha-query-builder-value-shell is-function'
            : 'sha-query-builder-packed-control sha-query-builder-packed-control--field',
        )}
      >
        <div className="sha-query-builder-source-slot">
          <SourceSelector
            variant="field"
            valueSources={FIELD_SOURCE_ITEMS}
            valueSrc={selectedFieldSrc}
            setValueSrc={handleFieldSrcChange}
            readonly={fieldReadonly}
          />
        </div>
        {isFieldFunc ? (
          <FieldFunctionEditor
            actions={actions}
            config={config}
            path={path}
            field={selectedField}
            readOnly={fieldReadonly}
          />
        ) : (
          <div className="sha-query-builder-field-slot">
            <FieldAutocomplete {...fieldProps} />
          </div>
        )}
      </div>

      <div className="sha-query-builder-operator-slot" title={activeOperatorLabel}>
        <div
          className="sha-query-builder-operator-select"
          onMouseDown={stopPointerPropagation}
          onPointerDown={stopPointerPropagation}
        >
          <Select
            value={selectedOperator}
            options={operatorOptions}
            variant="borderless"
            placeholder={config.settings?.operatorPlaceholder}
            onChange={(nextOperator) => actions.setOperator(path, nextOperator)}
            disabled={operatorReadonly || (!selectedField && !isFieldFunc)}
            popupMatchSelectWidth={false}
            size={config.settings?.renderSize === 'medium' ? 'middle' : config.settings?.renderSize}
          />
        </div>
      </div>

      <RuleValueEditor
        node={node}
        path={path}
        config={config}
        actions={actions}
        readOnly={readOnly}
      />
    </div>
  );
};

const QueryBuilderItem: React.FC<IBuilderItemProps> = ({
  actions,
  config,
  dragState,
  dropHint,
  index,
  node,
  onDragLeaveItem,
  onDragOverAppend,
  onDragOverItem,
  onDropAppend,
  onDropOnItem,
  onFinishDrag,
  onStartDrag,
  parentNode,
  path,
  readOnly,
  tree,
}) => {
  const pathKey = getPathKey(path);
  const isDropBefore = dropHint?.placement === 'before' && getPathKey(dropHint.path) === pathKey;
  const isDropAfter = dropHint?.placement === 'after' && getPathKey(dropHint.path) === pathKey;
  const canDelete = !readOnly;
  const siblingCount = getChildren(parentNode).length;
  const canDrag = !readOnly && config.settings?.canReorder !== false && siblingCount > 1;

  const handleRelationChange = (nextRelation: RelationValue): void => {
    if (!actions.setTree)
      return;

    const nextTree = (tree as unknown as {
      setIn: (path: Array<string | number>, value: unknown) => BuilderProps['tree'];
    }).setIn([...getImmutablePath(path), 'properties', '__relation'], nextRelation);

    actions.setTree(nextTree);
  };

  return (
    <div
      className={classNames(
        'sha-query-builder-item-row',
        isGroupNode(node) && 'is-group',
        isDropBefore && 'is-drop-before',
        isDropAfter && 'is-drop-after',
      )}
      onDragOver={onDragOverItem(path)}
      onDrop={onDropOnItem(path)}
      onDragLeave={onDragLeaveItem}
    >
      <div className="sha-query-builder-item-prefix">
        <RelationPrefix
          config={config}
          isFirst={index === 0}
          readOnly={getGroupReadonly(config, readOnly)}
          value={getSelectedRelation(node, parentNode, config)}
          onChange={handleRelationChange}
        />
      </div>

      <div className="sha-query-builder-item-main">
        {isGroupNode(node) ? (
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          <QueryBuilderGroup
            canDelete={canDelete}
            canDrag={canDrag}
            node={node}
            path={path}
            isRoot={false}
            config={config}
            actions={actions}
            tree={tree}
            readOnly={readOnly}
            dragState={dragState}
            dropHint={dropHint}
            onStartDrag={onStartDrag}
            onFinishDrag={onFinishDrag}
            onDragOverItem={onDragOverItem}
            onDropOnItem={onDropOnItem}
            onDragLeaveItem={onDragLeaveItem}
            onDragOverAppend={onDragOverAppend}
            onDropAppend={onDropAppend}
          />
        ) : (
          <QueryRuleRow
            node={node}
            path={path}
            config={config}
            actions={actions}
            readOnly={readOnly}
          />
        )}
      </div>

      {!isGroupNode(node) && (
        <QueryBuilderItemRail
          canDelete={canDelete}
          canDrag={canDrag}
          isGroup={false}
          onDelete={() => {
            actions.removeRule(path);
          }}
          onDragStart={onStartDrag(path)}
          onDragEnd={onFinishDrag}
        />
      )}
    </div>
  );
};

function QueryBuilderGroup({
  actions,
  canDelete,
  canDrag,
  config,
  dragState,
  dropHint,
  isRoot,
  node,
  onDragLeaveItem,
  onDragOverAppend,
  onDragOverItem,
  onDropAppend,
  onDropOnItem,
  onFinishDrag,
  onStartDrag,
  path,
  readOnly,
  tree,
}: IGroupProps): JSX.Element {
  const children = getChildren(node);
  const groupReadonly = getGroupReadonly(config, readOnly);

  if (isRoot) {
    const hasChildren = children.length > 0;
    const headingText = hasChildren ? getRootLogicLabel(node) : 'No filter conditions are applied';

    return (
      <div className={classNames('sha-query-builder-surface', !hasChildren && 'is-empty')}>
        <div className="sha-query-builder-heading">{headingText}</div>
        <div className={classNames('sha-query-builder-filter', !hasChildren && 'is-empty')}>
          <div className="sha-query-builder-filter-body">
            {children.map((child, index) => (
              <QueryBuilderItem
                key={child.id}
                node={child}
                parentNode={node}
                path={[...path, child.id]}
                index={index}
                config={config}
                actions={actions}
                tree={tree}
                readOnly={readOnly}
                dragState={dragState}
                dropHint={dropHint}
                onStartDrag={onStartDrag}
                onFinishDrag={onFinishDrag}
                onDragOverItem={onDragOverItem}
                onDropOnItem={onDropOnItem}
                onDragLeaveItem={onDragLeaveItem}
                onDragOverAppend={onDragOverAppend}
                onDropAppend={onDropAppend}
              />
            ))}
            {!hasChildren && <div className="sha-query-builder-empty-spacer" aria-hidden="true" />}
          </div>
          <div className={classNames('sha-query-builder-filter-actions', !hasChildren && 'is-empty')}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => actions.addRule(path)}
              disabled={groupReadonly}
            >
              Add Rule
            </Button>
            <Button
              icon={<FolderOutlined />}
              onClick={() => actions.addGroup(path)}
              disabled={groupReadonly}
            >
              Add Group
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'sha-query-builder-group-card',
        dropHint?.placement === 'append' && dropHint?.path && getPathKey(dropHint.path) === getPathKey(path) && 'is-drop-append',
      )}
      onDragOver={onDragOverAppend(path)}
      onDrop={onDropAppend(path)}
      onDragLeave={onDragLeaveItem}
    >
      <div className="sha-query-builder-group-header">
        <div className="sha-query-builder-group-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => actions.addRule(path)}
            disabled={groupReadonly}
            className="sha-query-builder-group-action-button"
            aria-label="Add Rule"
            title="Add Rule"
          >
          </Button>
          <Button
            icon={<FolderOutlined />}
            onClick={() => actions.addGroup(path)}
            disabled={groupReadonly}
            className="sha-query-builder-group-action-button"
            aria-label="Add Group"
            title="Add Group"
          >
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => actions.removeGroup(path)}
            disabled={!canDelete}
            danger
            className="sha-query-builder-group-action-button sha-query-builder-group-action-button--danger"
            aria-label="Delete Group"
            title="Delete Group"
          />
          <Button
            icon={<HolderOutlined />}
            draggable={canDrag}
            disabled={!canDrag}
            onDragStart={onStartDrag(path)}
            onDragEnd={onFinishDrag}
            className="sha-query-builder-group-action-button"
            aria-label="Drag Group"
            title="Drag Group"
          />
        </div>
      </div>

      <div className="sha-query-builder-group-children">
        {children.map((child, index) => (
          <QueryBuilderItem
            key={child.id}
            node={child}
            parentNode={node}
            path={[...path, child.id]}
            index={index}
            config={config}
            actions={actions}
            tree={tree}
            readOnly={readOnly}
            dragState={dragState}
            dropHint={dropHint}
            onStartDrag={onStartDrag}
            onFinishDrag={onFinishDrag}
            onDragOverItem={onDragOverItem}
            onDropOnItem={onDropOnItem}
            onDragLeaveItem={onDragLeaveItem}
            onDragOverAppend={onDragOverAppend}
            onDropAppend={onDropAppend}
          />
        ))}
      </div>
    </div>
  );
}

export const CustomQueryBuilder: React.FC<BuilderProps> = ({ actions, config, tree }) => {
  const plainTree = React.useMemo(() => QbUtils.getTree(tree) as IPlainTreeItem, [tree]);
  const rootPath = React.useMemo(() => [plainTree?.id ?? String(tree?.get?.('id') ?? '')], [plainTree?.id, tree]);
  const [dragState, setDragState] = React.useState<string[] | null>(null);
  const [dropHint, setDropHint] = React.useState<IDropHint | null>(null);
  const readOnly = getGroupReadonly(config, false) && getFieldSourceReadonly(config, false) && getValueReadonly(config, false);

  const resetDragState = React.useCallback((): void => {
    setDragState(null);
    setDropHint(null);
  }, []);

  const canAcceptDrop = React.useCallback((targetPath: string[]): boolean => {
    if (!dragState)
      return false;

    if (getPathKey(dragState) === getPathKey(targetPath))
      return false;

    return !isPathPrefix(dragState, targetPath);
  }, [dragState]);

  const onStartDrag = React.useCallback((path: string[]) => (event: React.DragEvent<HTMLButtonElement>): void => {
    if (readOnly)
      return;

    setDragState(path);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', getPathKey(path));
  }, [readOnly]);

  const onFinishDrag = React.useCallback((event: React.DragEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    resetDragState();
  }, [resetDragState]);

  const onDragOverItem = React.useCallback((path: string[]) => (event: React.DragEvent<HTMLDivElement>): void => {
    if (!canAcceptDrop(path))
      return;

    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const placement: DropPlacement = event.clientY < bounds.top + (bounds.height / 2) ? 'before' : 'after';
    setDropHint({ path, placement });
    event.dataTransfer.dropEffect = 'move';
  }, [canAcceptDrop]);

  const onDropOnItem = React.useCallback((path: string[]) => (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!dragState || !canAcceptDrop(path)) {
      resetDragState();
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const placement: DropPlacement = event.clientY < bounds.top + (bounds.height / 2) ? 'before' : 'after';
    actions.moveItem(dragState, path, placement);
    resetDragState();
  }, [actions, canAcceptDrop, dragState, resetDragState]);

  const onDragOverAppend = React.useCallback((path: string[]) => (event: React.DragEvent<HTMLDivElement>): void => {
    if (!canAcceptDrop(path))
      return;

    event.preventDefault();
    setDropHint({ path, placement: 'append' });
    event.dataTransfer.dropEffect = 'move';
  }, [canAcceptDrop]);

  const onDropAppend = React.useCallback((path: string[]) => (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!dragState || !canAcceptDrop(path)) {
      resetDragState();
      return;
    }

    actions.moveItem(dragState, path, 'append');
    resetDragState();
  }, [actions, canAcceptDrop, dragState, resetDragState]);

  const onDragLeaveItem = React.useCallback((event: React.DragEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDropHint(null);
    }
  }, []);

  if (!plainTree || !rootPath[0])
    return <div className="sha-query-builder-surface" />;

  return (
    <QueryBuilderGroup
      canDelete={false}
      canDrag={false}
      node={plainTree}
      path={rootPath}
      isRoot
      config={config}
      actions={actions}
      tree={tree}
      readOnly={readOnly}
      dragState={dragState}
      dropHint={dropHint}
      onStartDrag={onStartDrag}
      onFinishDrag={onFinishDrag}
      onDragOverItem={onDragOverItem}
      onDropOnItem={onDropOnItem}
      onDragLeaveItem={onDragLeaveItem}
      onDragOverAppend={onDragOverAppend}
      onDropAppend={onDropAppend}
    />
  );
};
