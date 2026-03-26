import React from 'react';
import { BaseWidget, BasicConfig, BooleanFieldSettings } from '@react-awesome-query-builder/antd';
import { Segmented } from 'antd';

type BooleanButtonSelectWidgetType = BaseWidget & BooleanFieldSettings;

const toSegmentedValue = (value: boolean | null | undefined): 'true' | 'false' => (value ? 'true' : 'false');

export const BooleanButtonSelectWidget: BooleanButtonSelectWidgetType = {
  ...BasicConfig.widgets.boolean,
  valueSrc: 'value',
  factory: (props) => {
    const labelYes = props.labelYes ?? 'Yes';
    const labelNo = props.labelNo ?? 'No';

    return (
      <Segmented
        block
        className="sha-query-builder-boolean-segmented"
        disabled={props.readonly}
        options={[
          { label: labelNo, value: 'false' },
          { label: labelYes, value: 'true' },
        ]}
        value={toSegmentedValue(props.value)}
        onChange={(value) => props.setValue(value === 'true')}
      />
    );
  },
};
