import React from 'react';
import { CaretDownOutlined, NumberOutlined } from '@ant-design/icons';
import type { RuleProps } from '@react-awesome-query-builder/antd';

export const EmptyRulePlaceholders = (props: RuleProps): JSX.Element | null => {
  const { selectedField } = props;
  if (selectedField)
    return null;

  return (
    <div className="sha-query-builder-empty-rule-placeholders">
      <div className="sha-query-builder-empty-operator" aria-hidden>
        <span className="sha-query-builder-empty-operator-text">Select operator</span>
        <CaretDownOutlined className="sha-query-builder-empty-caret" />
      </div>
      <div className="sha-query-builder-empty-value" aria-hidden>
        <div className="sha-query-builder-empty-value-type">
          <NumberOutlined className="sha-query-builder-empty-value-type-icon" />
          <CaretDownOutlined className="sha-query-builder-empty-caret" />
        </div>
        <div className="sha-query-builder-empty-value-text">Enter String</div>
      </div>
    </div>
  );
};
