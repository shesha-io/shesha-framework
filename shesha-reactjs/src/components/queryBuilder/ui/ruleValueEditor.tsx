import React from 'react';
import classNames from 'classnames';
import { Input } from 'antd';
import { QueryField, isDateLikeKind } from '../catalogue/fields';
import { OperatorDef } from '../catalogue/operators';
import { createValue } from '../model/factories';
import { RuleNode, RuleValue, ValueSource } from '../model/types';
import { SourceSelector } from '../sourceSelector';
import { useBuilder } from './context';
import { resolveValueEditor } from './editors/registry';
import { EditorValue } from './editors/types';
import { ExpressionValueEditor } from './expressionValueEditor';
import { FieldPicker } from './fieldPicker';

/** The source selector keeps the previous builder's keys so its icons and styles still apply. */
const SOURCE_KEYS: Record<ValueSource, string> = { value: 'value', field: 'field', expression: 'func' };
const SOURCE_LABELS: Record<ValueSource, string> = { value: 'Value', field: 'Field', expression: 'Function' };
const EMPTY_SOURCES: Array<[string, { label: string }]> = [['value', { label: 'Value' }]];
const fromSourceKey = (key: string): ValueSource => key === 'func' ? 'expression' : key === 'field' ? 'field' : 'value';

interface RuleValueEditorProps {
  rule: RuleNode;
  field: QueryField | undefined;
  operator: OperatorDef | undefined;
}

export const RuleValueEditor: React.FC<RuleValueEditorProps> = ({ rule, field, operator }) => {
  const { dispatch, readOnly } = useBuilder();

  // The design shows the value control before a field is chosen: a source icon and a disabled input.
  if (!field || !operator)
    return (
      <div className="sha-query-builder-value-shell sha-query-builder-value-shell--empty">
        <div className="sha-query-builder-source-slot">
          <SourceSelector variant="value" valueSources={EMPTY_SOURCES} valueSrc="value" setValueSrc={() => undefined} readonly />
        </div>
        <div className="sha-query-builder-value-editor">
          <div className="sha-query-builder-value-editor-slot sha-query-builder-control-slot">
            <Input size="small" disabled placeholder="Enter value" />
          </div>
        </div>
      </div>
    );

  if (operator.cardinality === 0)
    return null;

  const sourceItems: Array<[string, { label: string }]> = operator.sources.map((source) => [SOURCE_KEYS[source], { label: SOURCE_LABELS[source] }]);
  const showRangeSeparator = operator.cardinality === 2 && isDateLikeKind(field.kind);
  const placeholder = `Enter ${field.label}`;

  const valueAt = (index: number): RuleValue => rule.values[index] ?? createValue(operator.sources[0] ?? 'value');

  const setValue = (index: number, value: RuleValue): void => dispatch({ type: 'setValue', id: rule.id, index, value });

  const renderEditor = (index: number): React.ReactNode => {
    const value = valueAt(index);
    switch (value.source) {
      case 'expression':
        return (
          <ExpressionValueEditor
            value={value}
            onChange={(next) => setValue(index, next)}
            readOnly={readOnly}
            showRequiredToggle={operator.expressionLanguage !== 'javascript'}
          />
        );
      case 'field':
        return (
          <FieldPicker
            value={value.path}
            onChange={(path) => setValue(index, { source: 'field', path })}
            readOnly={readOnly}
            placeholder="Select field"
            compareTo={field.settings.propertyMetadata}
          />
        );
      default: {
        const Editor = resolveValueEditor(field.kind, operator);
        const title = typeof value.value === 'string' || typeof value.value === 'number' ? String(value.value) : undefined;
        return (
          <div className="sha-query-builder-widget-host" title={title}>
            <Editor
              field={field}
              operator={operator}
              value={value.value}
              onChange={(next: EditorValue) => setValue(index, { source: 'value', value: next })}
              readOnly={readOnly}
              placeholder={placeholder}
            />
          </div>
        );
      }
    }
  };

  const renderSourceSelector = (index: number): React.ReactNode => sourceItems.length > 1 && (
    <div className="sha-query-builder-source-slot">
      <SourceSelector
        variant="value"
        valueSources={sourceItems}
        valueSrc={SOURCE_KEYS[valueAt(index).source]}
        setValueSrc={(key) => dispatch({ type: 'setValueSource', id: rule.id, index, source: fromSourceKey(key) })}
        readonly={readOnly}
      />
    </div>
  );

  if (operator.cardinality === 1) {
    const isExpression = valueAt(0).source === 'expression';
    return (
      <div className={classNames('sha-query-builder-value-shell', isExpression && 'is-function')}>
        {renderSourceSelector(0)}
        {isExpression
          ? renderEditor(0)
          : (
            <div className="sha-query-builder-value-editor">
              <div className="sha-query-builder-value-editor-slot sha-query-builder-control-slot">{renderEditor(0)}</div>
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="sha-query-builder-value-shell">
      <div className={classNames('sha-query-builder-value-editor', 'is-range', showRangeSeparator && 'has-separator')}>
        {Array.from({ length: operator.cardinality }).map((_, index) => (
          <React.Fragment key={`${rule.id}-${index}`}>
            {showRangeSeparator && index > 0 && (
              <div className="sha-query-builder-value-range-separator" aria-hidden="true">-</div>
            )}
            <div className={classNames('sha-query-builder-value-editor-slot', 'sha-query-builder-control-slot', valueAt(index).source === 'expression' && 'is-function')}>
              {renderSourceSelector(index)}
              {renderEditor(index)}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
