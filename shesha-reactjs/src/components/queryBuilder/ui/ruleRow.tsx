import React from 'react';
import classNames from 'classnames';
import { Select } from 'antd';
import { findField, getFieldKind } from '../catalogue/fields';
import { getOperator, getOperatorsForKind } from '../catalogue/operators';
import { RuleNode } from '../model/types';
import { SourceSelector } from '../sourceSelector';
import { useBuilder } from './context';
import { FieldPicker } from './fieldPicker';
import { RuleValueEditor } from './ruleValueEditor';

const FIELD_SOURCE_ITEMS: Array<[string, { label: string }]> = [['field', { label: 'Field' }]];

const stopPointerPropagation = (event: React.MouseEvent | React.PointerEvent): void => {
  event.stopPropagation();
};

interface RuleRowProps {
  rule: RuleNode;
}

export const RuleRow: React.FC<RuleRowProps> = ({ rule }) => {
  const { dispatch, fields, readOnly } = useBuilder();
  const field = findField(fields, rule.field);
  const operators = getOperatorsForKind(field?.kind);
  const operator = getOperator(rule.operator);
  const operatorOptions = React.useMemo(() => operators.map((op) => ({ value: op.key, label: op.label })), [operators]);
  const isUnary = operator?.cardinality === 0;

  const onFieldChange = (path: string | undefined): void => {
    const nextKind = getFieldKind(findField(fields, path)?.property.dataType);
    const keepOperator = operator !== undefined && operator.kinds.includes(nextKind);
    dispatch({ type: 'setField', id: rule.id, field: path, resetOperator: !keepOperator });
  };

  return (
    <div className={classNames('sha-query-builder-rule-row', isUnary && 'is-unary')}>
      <div className="sha-query-builder-packed-control sha-query-builder-packed-control--field">
        <div className="sha-query-builder-source-slot">
          <SourceSelector
            variant="field"
            valueSources={FIELD_SOURCE_ITEMS}
            valueSrc="field"
            setValueSrc={() => undefined}
            readonly={readOnly}
          />
        </div>
        <div className="sha-query-builder-field-slot sha-query-builder-control-slot">
          <FieldPicker value={rule.field} onChange={onFieldChange} readOnly={readOnly} placeholder="Select field" />
        </div>
      </div>

      <div className="sha-query-builder-operator-slot" title={operator?.label}>
        <div
          className="sha-query-builder-operator-select sha-query-builder-control-slot"
          onMouseDown={stopPointerPropagation}
          onPointerDown={stopPointerPropagation}
        >
          <Select
            value={rule.operator}
            options={operatorOptions}
            variant="borderless"
            placeholder="Select operator"
            onChange={(next) => dispatch({ type: 'setOperator', id: rule.id, operator: next })}
            disabled={readOnly || field === undefined}
            popupMatchSelectWidth={false}
            size="small"
          />
        </div>
      </div>

      <RuleValueEditor rule={rule} field={field} operator={operator} />
    </div>
  );
};
