import React from 'react';
import { isEqual } from 'lodash';
import classNames from 'classnames';
import {
  Button,
  Dropdown,
  Select,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  FolderOutlined,
  HolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  BuilderProps,
  Config,
  FieldProps,
  FieldSource,
  FieldValue,
  FuncArg,
  FuncArgValue,
  FuncValue,
  RuleValue,
  SimpleValue,
  Utils as QbUtils,
  ValueSource,
  WidgetProps,
} from '@react-awesome-query-builder/antd';
import {
  getArgWidgetConfig,
  getFieldConfig,
  getFieldOperators,
  getFieldType,
  getFuncCandidates,
  getFuncConfig,
  getOperatorCardinality,
  getOperatorConfig,
  getTypeOperators,
  getWidgetConfig,
  renderWidget,
  toWidgetField,
  toWidgetFieldDefinition,
} from './raqbConfig';
import { FieldAutocomplete } from '../fieldAutocomplete';
import QueryRuleElement from '../groupEmptyState/queryRuleElement';
import { SourceSelector } from '../sourceSelector';
import { getRootLogicLabel, IPlainTreeNode } from '../treeRelations';
import { FieldWidgetProvider } from '../widgets/field/fieldWidgetContext';

/**
 * `RuleValue` from the query-builder lib includes an `any` member, which collapses the whole
 * union to `any` and trips no-unsafe-* rules. This is the same union without the `any` part.
 */
type SafeRuleValue = SimpleValue | FuncValue;

type RelationValue = 'AND' | 'OR';
type DropPlacement = 'before' | 'after' | 'append';

interface IPlainRuleProperties {
  /** A plain field path, or a `FuncValue` when `fieldSrc` is `func`. */
  field?: string | FuncValue;
  fieldSrc?: FieldSource;
  fieldType?: string;
  operator?: string;
  value?: SafeRuleValue[];
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

// Skip re-rendering a rule/value editor whose data is unchanged. `config`/`actions` are
// referentially stable across edits (qbConfig is memoized; actions come from RAQB), so a
// sibling edit — which only rebuilds the plain-tree node objects via getTree — is deep-equal
// here and short-circuits this row's expensive getFieldConfig/getValueSources/widget work.
// React.memo still lets context updates through, so this cannot cause stale UI.
const areRuleNodePropsEqual = (prev: IRuleProps, next: IRuleProps): boolean =>
  prev.config === next.config &&
  prev.actions === next.actions &&
  prev.readOnly === next.readOnly &&
  isEqual(prev.path, next.path) &&
  isEqual(prev.node, next.node);

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
const MAX_GROUP_NESTING = 3;
const NO_PARENT_FUNCS: Array<[string, string]> = [];


const isGroupNode = (node?: IPlainTreeItem): boolean => node?.type === 'group';

const getChildren = (node?: IPlainTreeItem): IPlainTreeItem[] => Array.isArray(node?.children1) ? node.children1 : [];

const getRelationOptions = (config: Config): Array<{ label: string; value: RelationValue }> => {
  return RELATION_OPTIONS.map((value) => ({
    value,
    label: config.conjunctions[value]?.label ?? value,
  }));
};

const getDefaultConjunction = (config: Config): RelationValue => {
  const configured = config.settings.defaultConjunction;
  return configured === 'OR' ? 'OR' : 'AND';
};

const getGroupLogicLabel = (node: IPlainTreeItem, config: Config): string => {
  const conjunction = node.properties?.conjunction ?? getDefaultConjunction(config);
  if (conjunction === 'OR')
    return 'Any of the following are true...';

  const children = getChildren(node);
  const hasOrRelation = children.some((child) => child.properties?.__relation === 'OR');
  return hasOrRelation
    ? 'Any of the following are true...'
    : 'All of the following are true...';
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
    treePath.push('children1', path[index] ?? '');
  }

  return treePath;
};

const getPathKey = (path: string[]): string => path.join('/');

const isPathPrefix = (prefix: string[], target: string[]): boolean => {
  if (prefix.length > target.length)
    return false;

  return prefix.every((segment, index) => target[index] === segment);
};

const getNodeAtPath = (root: IPlainTreeItem | undefined, path: string[]): IPlainTreeItem | undefined => {
  if (!root || path.length === 0 || root.id !== path[0])
    return undefined;

  let current: IPlainTreeItem | undefined = root;
  for (let index = 1; index < path.length; index += 1) {
    current = getChildren(current).find((child) => child.id === path[index]);
    if (!current)
      return undefined;
  }

  return current;
};

const getGroupNestingLevel = (path: string[]): number => {
  return Math.max(0, path.length - 1);
};

const canAddGroupAtPath = (path: string[]): boolean => {
  return getGroupNestingLevel(path) < MAX_GROUP_NESTING;
};

const getGroupSubtreeDepth = (node?: IPlainTreeItem): number => {
  if (!isGroupNode(node))
    return 0;

  return 1 + getChildren(node).reduce((maxDepth, child) => {
    return Math.max(maxDepth, getGroupSubtreeDepth(child));
  }, 0);
};

const canMoveNodeToParentPath = (
  root: IPlainTreeItem | undefined,
  draggedPath: string[],
  targetParentPath: string[],
): boolean => {
  const draggedNode = getNodeAtPath(root, draggedPath);
  if (!draggedNode)
    return false;

  if (!isGroupNode(draggedNode))
    return true;

  return getGroupNestingLevel(targetParentPath) + getGroupSubtreeDepth(draggedNode) <= MAX_GROUP_NESTING;
};

const getSourceLabel = (config: Config, source: string): string => {
  const valueSourcesInfo = (config.settings as Config['settings'] & {
    valueSourcesInfo?: Record<string, { label?: string } | string>;
  }).valueSourcesInfo;
  const sourceInfo = valueSourcesInfo?.[source];

  if (typeof sourceInfo === 'string')
    return sourceInfo;

  return sourceInfo?.label ?? DEFAULT_SOURCE_LABELS[source] ?? source;
};

const getValueSourceItems = (config: Config, sources: ValueSource[]): Array<[string, { label: string }]> => {
  return sources.map((source) => [source, { label: getSourceLabel(config, source) }]);
};

const toOperatorOptions = (config: Config, operatorKeys: string[]): Array<{ label: string; value: string }> =>
  operatorKeys.map((value) => ({
    value,
    label: config.operators[value]?.label ?? value,
  }));

const getOperatorOptions = (config: Config, field?: string): Array<{ label: string; value: string }> =>
  toOperatorOptions(config, getFieldOperators(config, field));

const getOperatorOptionsForType = (config: Config, typeName: string): Array<{ label: string; value: string }> =>
  toOperatorOptions(config, getTypeOperators(config, typeName));

const getConfigValueSources = (config: Config): ValueSource[] => {
  const valueSourceKeys = Object.keys(config.settings.valueSourcesInfo ?? {});
  return (valueSourceKeys.length > 0 ? valueSourceKeys : ['value']) as ValueSource[];
};

const getValueSources = (config: Config, field?: FieldValue, operator?: string): ValueSource[] => {
  if (!field || !operator)
    return ['value'];

  const fieldConfig = getFieldConfig(config, field);
  const fieldType = getFieldType(fieldConfig);
  const typeDefinition = fieldType !== undefined ? config.types[fieldType] : undefined;
  const operatorConfig = getOperatorConfig(config, operator, field);

  const fieldValueSources = Array.isArray(fieldConfig?.valueSources) && fieldConfig.valueSources.length > 0
    ? fieldConfig.valueSources
    : Array.isArray(typeDefinition?.valueSources) && typeDefinition.valueSources.length > 0
      ? typeDefinition.valueSources
      : getConfigValueSources(config);

  const operatorValueSources = operatorConfig?.valueSources;
  if (!Array.isArray(operatorValueSources) || operatorValueSources.length === 0)
    return fieldValueSources;

  const filteredValueSources = fieldValueSources.filter((source) => operatorValueSources.includes(source));
  return filteredValueSources.length > 0 ? filteredValueSources : ['value'];
};

const getFieldSourceReadonly = (config: Config, readOnly: boolean): boolean => {
  return readOnly || config.settings.immutableFieldsMode === true;
};

const getOperatorReadonly = (config: Config, readOnly: boolean): boolean => {
  return readOnly || config.settings.immutableOpsMode === true;
};

const getValueReadonly = (config: Config, readOnly: boolean): boolean => {
  return readOnly || config.settings.immutableValuesMode === true;
};

const getGroupReadonly = (config: Config, readOnly: boolean): boolean => {
  return readOnly || config.settings.immutableGroupsMode === true;
};

const getPrimitiveTitle = (value: RuleValue | undefined): string | undefined => {
  if (typeof value === 'string')
    return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);

  return undefined;
};

const isBooleanFieldType = (fieldType?: string): boolean => fieldType === 'boolean' || fieldType === 'strict-boolean';
const isDateLikeFieldType = (fieldType?: string): boolean => fieldType === 'date' || fieldType === 'datetime' || fieldType === 'time';

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
        size={config.settings.renderSize === 'medium' ? 'middle' : config.settings.renderSize}
      />
    </div>
  );
};

const QueryBuilderItemAction: React.FC<{
  action: 'delete' | 'drag';
  disabled: boolean;
  onDelete?: () => void;
  onDragStart?: React.DragEventHandler<HTMLButtonElement>;
  onDragEnd?: React.DragEventHandler<HTMLButtonElement>;
}> = ({ action, disabled, onDelete, onDragEnd, onDragStart }) => {
  const isDelete = action === 'delete';

  return (
    <button
      type="button"
      className={classNames(
        'sha-query-builder-item-action',
        isDelete
          ? 'sha-query-builder-item-action--delete'
          : 'sha-query-builder-item-action--drag',
      )}
      onClick={isDelete ? onDelete : undefined}
      draggable={!isDelete && !disabled}
      disabled={disabled}
      onDragStart={!isDelete ? onDragStart : undefined}
      onDragEnd={!isDelete ? onDragEnd : undefined}
      aria-label={isDelete ? 'Delete' : 'Drag'}
      title={isDelete ? 'Delete' : 'Drag'}
    >
      {isDelete ? <DeleteOutlined /> : <HolderOutlined />}
    </button>
  );
};

/** Picks a field path. Used for a rule's right-hand side and for any function argument sourced from a field. */
const FieldPathEditor: React.FC<{
  config: Config;
  contextField: FieldValue;
  fieldDefinition: WidgetProps['fieldDefinition'];
  fieldType?: string;
  operator: string;
  readOnly: boolean;
  selectedKey?: string;
  setField: (nextField: string) => void;
}> = ({ config, contextField, fieldDefinition, fieldType, operator, readOnly, selectedKey, setField }) => {
  const widgetProps = React.useMemo<WidgetProps>(() => ({
    placeholder: 'Select field',
    config,
    field: toWidgetField(contextField),
    fieldDefinition,
    fieldSrc: 'field',
    ...(fieldType !== undefined ? { fieldType } : {}),
    operator,
    value: selectedKey,
    readonly: readOnly,
    setValue: (nextValue: RuleValue): void => {
      if (typeof nextValue === 'string')
        setField(nextValue);
    },
  }), [config, contextField, fieldDefinition, fieldType, operator, readOnly, selectedKey, setField]);

  const fieldProps = React.useMemo<FieldProps>(() => ({
    items: [],
    config,
    placeholder: 'Select field',
    selectedFieldSrc: 'field',
    selectedKey,
    readonly: readOnly,
    setField,
  }), [config, readOnly, selectedKey, setField]);

  return (
    <FieldWidgetProvider widgetProps={widgetProps}>
      <FieldAutocomplete {...fieldProps} />
    </FieldWidgetProvider>
  );
};

const RuleWidgetEditorInner: React.FC<{
  actions: BuilderProps['actions'];
  config: Config;
  field: FieldValue;
  fieldType?: string;
  operator: string;
  path: string[];
  delta: number;
  readOnly: boolean;
  valueSrc: ValueSource;
  value?: SafeRuleValue;
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
}) => {
  if (valueSrc === 'field') {
    return (
      <FieldPathEditor
        config={config}
        contextField={field}
        fieldDefinition={toWidgetFieldDefinition(getFieldConfig(config, field))}
        {...(fieldType !== undefined ? { fieldType } : {})}
        operator={operator}
        readOnly={readOnly}
        {...(typeof value === 'string' ? { selectedKey: value } : {})}
        setField={(nextField: string): void => {
          actions.setValue(path, delta, nextField, fieldType ?? 'text');
        }}
      />
    );
  }

  const fieldDefinition = getFieldConfig(config, field);
  const widgetDefinition = getWidgetConfig(config, field, operator, valueSrc);
  const fieldConfigType = getFieldType(fieldDefinition);
  const fieldConfigLabel = fieldDefinition?.label;
  const fieldConfigSettings = fieldDefinition?.fieldSettings;

  if (!widgetDefinition) {
    return <div className="sha-query-builder-value-placeholder" />;
  }

  const widgetType = 'type' in widgetDefinition ? widgetDefinition.type : undefined;
  const nextValueType = valueType ?? widgetType ?? fieldType ?? fieldConfigType ?? 'text';
  const placeholder = widgetDefinition.valuePlaceholder ?? (fieldConfigLabel ? `Enter ${fieldConfigLabel}` : 'Enter value');
  const widgetProps: WidgetProps = {
    ...(fieldConfigSettings ?? {}),
    placeholder,
    field: toWidgetField(field),
    fieldDefinition: toWidgetFieldDefinition(fieldDefinition),
    fieldSrc: 'field',
    ...(fieldType !== undefined ? { fieldType } : {}),
    operator,
    config,
    delta,
    readonly: readOnly,
    value,
    valueError: valueError ?? undefined,
    errorMessage: valueError ?? undefined,
    setValue: (nextValue: RuleValue): void => {
      actions.setValue(path, delta, nextValue, nextValueType);
    },
  };

  return (
    <div className="sha-query-builder-widget-host" title={getPrimitiveTitle(value)}>
      {renderWidget(widgetDefinition, widgetProps, config.ctx)}
    </div>
  );
};

const areRuleWidgetPropsEqual = (
  prev: Readonly<React.ComponentProps<typeof RuleWidgetEditorInner>>,
  next: Readonly<React.ComponentProps<typeof RuleWidgetEditorInner>>,
): boolean =>
  prev.config === next.config &&
  prev.actions === next.actions &&
  prev.field === next.field &&
  prev.fieldType === next.fieldType &&
  prev.operator === next.operator &&
  prev.delta === next.delta &&
  prev.readOnly === next.readOnly &&
  prev.valueSrc === next.valueSrc &&
  prev.valueType === next.valueType &&
  prev.valueError === next.valueError &&
  isEqual(prev.path, next.path) &&
  isEqual(prev.value, next.value);

const RuleWidgetEditor = React.memo(RuleWidgetEditorInner, areRuleWidgetPropsEqual);

/** Takes `unknown` deliberately: `FuncValue.args` is typed through `RuleValue`, which carries `any`. */
const isFuncValue = (value: unknown): value is FuncValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && 'func' in value;

const FuncArgEditor: React.FC<{
  actions: BuilderProps['actions'];
  arg: FuncArg;
  argKey: string;
  argValue?: FuncArgValue<RuleValue>;
  config: Config;
  delta: number;
  funcKey: string;
  parentFuncs: Array<[string, string]>;
  path: string[];
  readOnly: boolean;
}> = ({ actions, arg, argKey, argValue, config, delta, funcKey, parentFuncs, path, readOnly }) => {
  // An argument declares its own sources — `LOWER(str)` accepts a field, not just a typed literal.
  const availableSources: ValueSource[] = Array.isArray(arg.valueSources) && arg.valueSources.length > 0
    ? arg.valueSources
    : ['value'];
  const rawSource = argValue?.valueSrc;
  const argSource: ValueSource = rawSource !== undefined && availableSources.includes(rawSource)
    ? rawSource
    : availableSources[0] ?? 'value';

  const setArgSource = (nextSource: string): void => {
    if (nextSource === argSource)
      return;

    actions.setFuncValue(path, delta, parentFuncs, argKey, nextSource, '!valueSrc');
  };

  const renderArgEditor = (): React.ReactNode => {
    if (argSource === 'func') {
      return (
        <FuncEditor
          actions={actions}
          config={config}
          delta={delta}
          expectedType={arg.type}
          parentFuncs={[...parentFuncs, [funcKey, argKey]]}
          path={path}
          readOnly={readOnly}
          {...(isFuncValue(argValue?.value) ? { value: argValue.value } : {})}
        />
      );
    }

    if (argSource === 'field') {
      return (
        <FieldPathEditor
          config={config}
          contextField={argKey}
          fieldDefinition={toWidgetFieldDefinition(arg)}
          fieldType={arg.type}
          operator=""
          readOnly={readOnly}
          {...(typeof argValue?.value === 'string' ? { selectedKey: argValue.value } : {})}
          setField={(nextField: string): void => {
            actions.setFuncValue(path, delta, parentFuncs, argKey, nextField, arg.type);
          }}
        />
      );
    }

    const widgetDefinition = getArgWidgetConfig(config, arg);
    if (!widgetDefinition)
      return null;

    const widgetProps: WidgetProps = {
      ...(arg.fieldSettings ?? {}),
      placeholder: arg.label ?? argKey,
      field: argKey,
      fieldDefinition: toWidgetFieldDefinition(arg),
      fieldSrc: 'field',
      fieldType: arg.type,
      operator: '',
      config,
      delta,
      readonly: readOnly,
      value: argValue?.value,
      setValue: (nextValue: SafeRuleValue): void => {
        if (isFuncValue(nextValue))
          return;

        actions.setFuncValue(path, delta, parentFuncs, argKey, nextValue, arg.type);
      },
    };

    return renderWidget(widgetDefinition, widgetProps, config.ctx);
  };

  return (
    <div className={`sha-query-builder-func-arg sha-query-builder-control-slot sha-query-builder-func-arg--${argKey}`}>
      {availableSources.length > 1 && (
        <div className="sha-query-builder-source-slot">
          <SourceSelector
            variant="value"
            valueSources={getValueSourceItems(config, availableSources)}
            valueSrc={argSource}
            setValueSrc={setArgSource}
            readonly={readOnly}
          />
        </div>
      )}
      {renderArgEditor()}
    </div>
  );
};

/**
 * Renders a function value the way RAQB documents it: a selector over the functions the config
 * declares for the expected return type, then one widget per *declared* arg. Binding by declared arg
 * name is what keeps the value round-tripping through the function's own `jsonLogic` formatter.
 */
const FuncEditor: React.FC<{
  actions: BuilderProps['actions'];
  config: Config;
  delta: number;
  expectedType?: string;
  /** Chain of [funcKey, argKey] pairs identifying a nested function; empty at the top level. */
  parentFuncs?: Array<[string, string]>;
  path: string[];
  readOnly: boolean;
  value?: SafeRuleValue;
}> = ({ actions, config, delta, expectedType, parentFuncs = NO_PARENT_FUNCS, path, readOnly, value }) => {
  const funcValue = isFuncValue(value) ? value : null;
  const funcKey = funcValue?.func;
  const funcDefinition = getFuncConfig(config, funcKey);
  const candidates = React.useMemo(
    () => getFuncCandidates(config, expectedType),
    [config, expectedType],
  );

  const setFunc = React.useCallback((nextFunc: string): void => {
    actions.setFuncValue(path, delta, parentFuncs, null, nextFunc, '!func');
  }, [actions, delta, parentFuncs, path]);

  // Nothing picked yet: fall back to the config's hidden func for this type (the inline mustache
  // `EVALUATE_*`), else the first selectable one, so switching to the func source is never a blank row.
  const defaultFuncKey = (candidates.find((candidate) => candidate.hidden) ?? candidates[0])?.key;
  // Applied at most once per target. Without this, a default that the store declines to persist
  // re-triggers the effect on every render and spins the tab into an infinite dispatch loop.
  const targetKey = `${getPathKey(path)}:${delta}:${parentFuncs.map(([f, a]) => `${f}.${a}`).join('>')}`;
  const appliedDefaultFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (funcKey !== undefined || defaultFuncKey === undefined)
      return;
    if (appliedDefaultFor.current === targetKey)
      return;

    appliedDefaultFor.current = targetKey;
    setFunc(defaultFuncKey);
  }, [defaultFuncKey, funcKey, setFunc, targetKey]);

  // A hidden func stays listed while it is the current selection, otherwise the box reads as empty.
  const funcOptions = React.useMemo(
    () => candidates
      .filter((candidate) => !candidate.hidden || candidate.key === funcKey)
      .map(({ key, label }) => ({ value: key, label })),
    [candidates, funcKey],
  );

  // A zero-argument function such as `NOW` omits `args` entirely, despite the type declaring it.
  const funcArgs = funcDefinition?.args ?? {};
  const argEntries = Object.keys(funcArgs)
    .map((argKey) => ({ argKey, arg: funcArgs[argKey] }))
    .filter((entry): entry is { argKey: string; arg: FuncArg } => entry.arg !== undefined);

  return (
    <div className="sha-query-builder-func-editor">
      {funcOptions.length > 1 && (
        <div className="sha-query-builder-func-select sha-query-builder-control-slot">
          <Select
            {...(funcKey !== undefined ? { value: funcKey } : {})}
            {...(config.settings.funcPlaceholder !== undefined ? { placeholder: config.settings.funcPlaceholder } : {})}
            options={funcOptions}
            onChange={setFunc}
            disabled={readOnly}
            showSearch={{
              filterOption: (input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
            }}
            popupMatchSelectWidth={false}
            style={{ width: '100%' }}
          />
        </div>
      )}
      {argEntries.length > 0 && (
        <div className="sha-query-builder-func-args">
          {argEntries.map(({ argKey, arg }) => (
            <FuncArgEditor
              key={argKey}
              actions={actions}
              arg={arg}
              argKey={argKey}
              {...(funcValue?.args[argKey] !== undefined ? { argValue: funcValue.args[argKey] } : {})}
              config={config}
              delta={delta}
              funcKey={funcKey ?? ''}
              parentFuncs={parentFuncs}
              path={path}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RuleValueEditorInner: React.FC<{
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
  const fieldDefinition = getFieldConfig(config, selectedField);
  const fieldType = properties.fieldType ?? getFieldType(fieldDefinition);
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
          {...(fieldType !== undefined ? { fieldType } : {})}
          operator={selectedOperator}
          path={path}
          readOnly={getValueReadonly(config, readOnly)}
          value={values[0]}
          {...(valueErrors[0] !== undefined ? { valueError: valueErrors[0] } : {})}
          valueSrc="value"
          {...(valueTypes[0] !== undefined ? { valueType: valueTypes[0] } : {})}
        />
      </div>
    );
  }

  const availableSources = getValueSources(config, selectedField, selectedOperator);
  const showRangeSeparator = cardinality === 2 && isDateLikeFieldType(fieldType);
  const sourceItems = getValueSourceItems(config, availableSources);
  const valueReadonly = getValueReadonly(config, readOnly);
  // A multi-value operator (`between`) holds an independent source per side, so each side owns its
  // own selector. Collapsing them onto `valueSrc[0]` is what hid the second one.
  const isSingleValue = cardinality === 1;

  const getDeltaSource = (delta: number): ValueSource => {
    const rawDeltaSource = valueSrcs[delta];
    return rawDeltaSource !== undefined && availableSources.includes(rawDeltaSource)
      ? rawDeltaSource
      : availableSources[0] ?? 'value';
  };

  const handleDeltaSourceChange = (delta: number) => (nextSource: string): void => {
    if (nextSource === getDeltaSource(delta))
      return;

    actions.setValueSrc(path, delta, nextSource as ValueSource);
    actions.setValue(
      path,
      delta,
      undefined,
      valueTypes[delta] ?? fieldType ?? 'text',
    );
  };

  const renderDeltaEditor = (delta: number, deltaSource: ValueSource): React.ReactNode => {
    if (deltaSource === 'func') {
      return (
        <FuncEditor
          config={config}
          delta={delta}
          {...(fieldType !== undefined ? { expectedType: fieldType } : {})}
          path={path}
          actions={actions}
          readOnly={valueReadonly}
          value={values[delta]}
        />
      );
    }

    return (
      <RuleWidgetEditor
        actions={actions}
        config={config}
        delta={delta}
        field={selectedField}
        {...(fieldType !== undefined ? { fieldType } : {})}
        operator={selectedOperator}
        path={path}
        readOnly={valueReadonly}
        value={values[delta]}
        {...(valueErrors[delta] !== undefined ? { valueError: valueErrors[delta] } : {})}
        valueSrc={deltaSource}
        {...(valueTypes[delta] !== undefined ? { valueType: valueTypes[delta] } : {})}
      />
    );
  };

  const renderSourceSelector = (delta: number, deltaSource: ValueSource): React.ReactNode => (
    <div className="sha-query-builder-source-slot">
      <SourceSelector
        variant="value"
        valueSources={sourceItems}
        valueSrc={deltaSource}
        setValueSrc={handleDeltaSourceChange(delta)}
        readonly={valueReadonly}
      />
    </div>
  );

  if (isSingleValue) {
    const deltaSource = getDeltaSource(0);
    return (
      <div className={classNames('sha-query-builder-value-shell', deltaSource === 'func' && 'is-function')}>
        {renderSourceSelector(0, deltaSource)}
        {deltaSource === 'func'
          ? renderDeltaEditor(0, deltaSource)
          : (
            <div className="sha-query-builder-value-editor">
              <div className="sha-query-builder-value-editor-slot sha-query-builder-control-slot">{renderDeltaEditor(0, deltaSource)}</div>
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="sha-query-builder-value-shell">
      <div className={classNames('sha-query-builder-value-editor', 'is-range', showRangeSeparator && 'has-separator')}>
        {Array.from({ length: cardinality }).map((_, delta) => {
          const deltaSource = getDeltaSource(delta);
          return (
            <React.Fragment key={`${node.id}-${delta}`}>
              {showRangeSeparator && delta > 0 && (
                <div className="sha-query-builder-value-range-separator" aria-hidden="true">-</div>
              )}
              <div className={classNames('sha-query-builder-value-editor-slot', 'sha-query-builder-control-slot', deltaSource === 'func' && 'is-function')}>
                {renderSourceSelector(delta, deltaSource)}
                {renderDeltaEditor(delta, deltaSource)}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const RuleValueEditor = React.memo(RuleValueEditorInner, areRuleNodePropsEqual);

const QueryRuleRowInner: React.FC<IRuleProps> = (props) => {
  const {
    actions,
    config,
    node,
    path,
    readOnly,
  } = props;
  const properties = (node.properties ?? {}) as IPlainRuleProperties;
  const selectedField = properties.field;
  const selectedFieldKey = typeof selectedField === 'string' ? selectedField : undefined;
  const selectedFieldSrc: FieldSource = properties.fieldSrc ?? 'field';
  const isFieldFunc = selectedFieldSrc === 'func';
  const selectedOperator = properties.operator;
  // When field side is a func, derive operators from the function return type (text for UPPER/LOWER).
  // Memoized: a fresh array each render makes the (open) operator <Select> re-run rc-virtual-list
  // scrollTo on every render ("reach the max limitation"), which keeps the row churning.
  const operatorOptions = React.useMemo(
    () => isFieldFunc
      ? getOperatorOptionsForType(config, 'text')
      : getOperatorOptions(config, selectedFieldKey),
    [config, isFieldFunc, selectedFieldKey],
  );
  const fieldReadonly = getFieldSourceReadonly(config, readOnly);
  const operatorReadonly = getOperatorReadonly(config, readOnly);
  const activeOperatorLabel = operatorOptions.find((item) => item.value === selectedOperator)?.label;

  const handleFieldSrcChange = (nextSrc: string): void => {
    if (nextSrc === selectedFieldSrc)
      return;

    if (nextSrc === 'func') {
      actions.setFieldSrc(path, 'func');
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
    ...(config.settings.fieldPlaceholder !== undefined ? { placeholder: config.settings.fieldPlaceholder } : {}),
    selectedFieldSrc: 'field',
    selectedKey: selectedFieldKey,
    readonly: fieldReadonly,
    setField: (nextField: string): void => {
      actions.setField(path, nextField);
    },
  };

  const isUnaryOperator = getOperatorCardinality(config, selectedOperator) === 0;

  return (
    <div className={classNames('sha-query-builder-rule-row', isUnaryOperator && 'is-unary')}>
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
          <FuncEditor
            actions={actions}
            config={config}
            delta={-1}
            expectedType="text"
            path={path}
            readOnly={fieldReadonly}
            {...(isFuncValue(selectedField) ? { value: selectedField } : {})}
          />
        ) : (
          <div className="sha-query-builder-field-slot sha-query-builder-control-slot">
            <FieldAutocomplete {...fieldProps} />
          </div>
        )}
      </div>

      <div className="sha-query-builder-operator-slot" title={activeOperatorLabel}>
        <div
          className="sha-query-builder-operator-select sha-query-builder-control-slot"
          onMouseDown={stopPointerPropagation}
          onPointerDown={stopPointerPropagation}
        >
          <Select
            {...(selectedOperator !== undefined ? { value: selectedOperator } : {})}
            options={operatorOptions}
            variant="borderless"
            {...(config.settings.operatorPlaceholder !== undefined ? { placeholder: config.settings.operatorPlaceholder } : {})}
            onChange={(nextOperator) => actions.setOperator(path, nextOperator)}
            disabled={operatorReadonly || (!selectedField && !isFieldFunc)}
            popupMatchSelectWidth={false}
            {...(config.settings.renderSize !== undefined ? { size: config.settings.renderSize === 'medium' ? 'middle' : config.settings.renderSize } : {})}
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

const QueryRuleRow = React.memo(QueryRuleRowInner, areRuleNodePropsEqual);

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
  const groupReadOnly = getGroupReadonly(config, readOnly);
  const canDelete = !groupReadOnly;
  const siblingCount = getChildren(parentNode).length;
  const isNested = path.length > 2;
  const canDrag = !groupReadOnly && config.settings.canReorder !== false && (siblingCount > 1 || isNested);

  const handleRelationChange = (nextRelation: RelationValue): void => {
    const nextTree = tree.setIn([...getImmutablePath(path), 'properties', '__relation'], nextRelation);

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
          <div className="sha-query-builder-item-shell">
            <div className="sha-query-builder-rule-scroll">
              <QueryRuleRow
                node={node}
                path={path}
                config={config}
                actions={actions}
                readOnly={readOnly}
              />
            </div>
            <QueryBuilderItemAction
              action="delete"
              disabled={!canDelete}
              onDelete={() => {
                actions.removeRule(path);
              }}
            />
            <QueryBuilderItemAction
              action="drag"
              disabled={!canDrag}
              onDragStart={onStartDrag(path)}
              onDragEnd={onFinishDrag}
            />
          </div>
        )}
      </div>
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
}: IGroupProps): React.JSX.Element {
  const children = getChildren(node);
  const groupReadonly = getGroupReadonly(config, readOnly);
  const canAddGroup = canAddGroupAtPath(path);

  if (isRoot) {
    const hasChildren = children.length > 0;

    if (!hasChildren) {
      return (
        <div className="sha-query-builder-surface is-empty">
          <QueryRuleElement
            onAddRule={() => actions.addRule(path)}
            {...(canAddGroup ? { onAddGroup: () => actions.addGroup(path) } : {})}
            disabled={groupReadonly}
            addGroupDisabled={!canAddGroup}
          />
        </div>
      );
    }

    const headingText = getRootLogicLabel(node);

    return (
      <div className="sha-query-builder-surface">
        <div className="sha-query-builder-heading">{headingText}</div>
        <div className="sha-query-builder-filter">
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
          </div>
          <div className="sha-query-builder-filter-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => actions.addRule(path)}
              disabled={groupReadonly}
            >
              Add Rule
            </Button>
            <Tooltip title={!canAddGroup ? 'Maximum group nesting level reached' : undefined}>
              <Button
                icon={<FolderOutlined />}
                onClick={() => actions.addGroup(path)}
                disabled={groupReadonly || !canAddGroup}
              >
                Add Group
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  const groupLogicText = getGroupLogicLabel(node, config);

  return (
    <div
      className={classNames(
        'sha-query-builder-group-card',
        dropHint?.placement === 'append' && getPathKey(dropHint.path) === getPathKey(path) && 'is-drop-append',
      )}
      onDragOver={onDragOverAppend(path)}
      onDrop={onDropAppend(path)}
      onDragLeave={onDragLeaveItem}
    >
      <div className="sha-query-builder-group-header">
        <div className="sha-query-builder-group-heading" title={groupLogicText}>
          {groupLogicText}
        </div>

        <div className="sha-query-builder-group-actions">
          <Dropdown
            menu={{
              items: [
                { key: 'rule', icon: <PlusOutlined />, label: 'Add Rule', onClick: () => actions.addRule(path) },
                { key: 'group', icon: <FolderOutlined />, label: !canAddGroup ? <Tooltip title="Maximum group nesting level reached">Add Group</Tooltip> : 'Add Group', onClick: () => actions.addGroup(path), disabled: !canAddGroup },
              ],
            }}
            trigger={['click']}
            disabled={groupReadonly}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={groupReadonly}
              className="sha-query-builder-group-action-button"
              aria-label="Add"
              title="Add"
            />
          </Dropdown>
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
            className="sha-query-builder-group-action-button sha-query-builder-group-action-button--drag"
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
        {children.length === 0 && dropHint?.placement === 'append' && getPathKey(dropHint.path) === getPathKey(path) && (
          <div className="sha-query-builder-drop-placeholder" />
        )}
      </div>
    </div>
  );
}

export const CustomQueryBuilder: React.FC<BuilderProps> = ({ actions, config, tree }) => {
  const plainTree = React.useMemo(() => QbUtils.getTree(tree) as IPlainTreeItem, [tree]);
  const rootPath = React.useMemo(() => [plainTree.id], [plainTree.id]);
  const [dragState, setDragState] = React.useState<string[] | null>(null);
  const [dropHint, setDropHint] = React.useState<IDropHint | null>(null);
  // Drag is a structural/reorder operation, so gate it on group-readonly (consistent with canDrag).
  const readOnly = getGroupReadonly(config, false);

  const resetDragState = React.useCallback((): void => {
    setDragState(null);
    setDropHint(null);
  }, []);

  const canAcceptDrop = React.useCallback((targetPath: string[], placement: DropPlacement): boolean => {
    if (!dragState)
      return false;

    if (getPathKey(dragState) === getPathKey(targetPath))
      return false;

    if (isPathPrefix(dragState, targetPath))
      return false;

    const targetParentPath = placement === 'append'
      ? targetPath
      : targetPath.slice(0, -1);

    return canMoveNodeToParentPath(plainTree, dragState, targetParentPath);
  }, [dragState, plainTree]);

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
    const bounds = event.currentTarget.getBoundingClientRect();
    const placement: DropPlacement = event.clientY < bounds.top + (bounds.height / 2) ? 'before' : 'after';
    if (!canAcceptDrop(path, placement))
      return;

    event.preventDefault();
    event.stopPropagation();
    setDropHint({ path, placement });
    event.dataTransfer.dropEffect = 'move';
  }, [canAcceptDrop]);

  const onDropOnItem = React.useCallback((path: string[]) => (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    const bounds = event.currentTarget.getBoundingClientRect();
    const placement: DropPlacement = event.clientY < bounds.top + (bounds.height / 2) ? 'before' : 'after';
    if (!dragState || !canAcceptDrop(path, placement)) {
      resetDragState();
      return;
    }

    actions.moveItem(dragState, path, placement);
    resetDragState();
  }, [actions, canAcceptDrop, dragState, resetDragState]);

  const onDragOverAppend = React.useCallback((path: string[]) => (event: React.DragEvent<HTMLDivElement>): void => {
    if (!canAcceptDrop(path, 'append'))
      return;

    event.preventDefault();
    setDropHint({ path, placement: 'append' });
    event.dataTransfer.dropEffect = 'move';
  }, [canAcceptDrop]);

  const onDropAppend = React.useCallback((path: string[]) => (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!dragState || !canAcceptDrop(path, 'append')) {
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

  if (!rootPath[0])
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
