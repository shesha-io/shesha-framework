import React from 'react';
import { BaseWidget, BasicConfig, BooleanFieldSettings } from '@react-awesome-query-builder/antd';

type BooleanButtonSelectWidgetType = BaseWidget & BooleanFieldSettings;

interface BoolButtonGroupProps {
  value: boolean;
  readonly?: boolean;
  labelYes: string;
  labelNo: string;
  onChange: (value: boolean) => void;
}

const BoolButtonGroup = ({ value, readonly, labelYes, labelNo, onChange }: BoolButtonGroupProps): React.JSX.Element => (
  <div className={`sha-bool-btn-group${readonly ? ' is-disabled' : ''}`}>
    <button
      type="button"
      className={`sha-bool-btn-group__btn${value === true ? ' is-active' : ''}`}
      onClick={() => onChange(true)}
    >
      {labelYes}
    </button>
    <button
      type="button"
      className={`sha-bool-btn-group__btn${value === false ? ' is-active' : ''}`}
      onClick={() => onChange(false)}
    >
      {labelNo}
    </button>
  </div>
);

export const BooleanButtonSelectWidget: BooleanButtonSelectWidgetType = {
  ...BasicConfig.widgets.boolean,
  valueSrc: 'value',
  factory: (props) => {
    const extProps = props as Omit<typeof props, 'value'> & { labelYes?: string; labelNo?: string; value?: boolean };
    const labelYes = extProps.labelYes ?? 'Yes';
    const labelNo = extProps.labelNo ?? 'No';

    return (
      <BoolButtonGroup
        value={extProps.value ?? true}
        {...(props.readonly !== undefined ? { readonly: props.readonly } : {})}
        labelYes={labelYes}
        labelNo={labelNo}
        onChange={(val) => props.setValue(val)}
      />
    );
  },
};
