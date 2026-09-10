import React from 'react';
import { asScalar, EditorProps } from './types';

interface BoolButtonGroupProps {
  value?: boolean | undefined;
  readOnly?: boolean | undefined;
  labelYes: string;
  labelNo: string;
  onChange: (value: boolean) => void;
}

export const BoolButtonGroup: React.FC<BoolButtonGroupProps> = ({ value, readOnly, labelYes, labelNo, onChange }) => (
  <div className={`sha-bool-btn-group${readOnly === true ? ' is-disabled' : ''}`}>
    <button
      type="button"
      disabled={readOnly}
      className={`sha-bool-btn-group__btn${value === true ? ' is-active' : ''}`}
      onClick={() => onChange(true)}
    >
      {labelYes}
    </button>
    <button
      type="button"
      disabled={readOnly}
      className={`sha-bool-btn-group__btn${value === false ? ' is-active' : ''}`}
      onClick={() => onChange(false)}
    >
      {labelNo}
    </button>
  </div>
);

export const BooleanEditor: React.FC<EditorProps> = ({ value, onChange, readOnly }) => {
  const current = asScalar(value);
  return (
    <BoolButtonGroup
      value={typeof current === 'boolean' ? current : undefined}
      readOnly={readOnly}
      labelYes="Yes"
      labelNo="No"
      onChange={onChange}
    />
  );
};
