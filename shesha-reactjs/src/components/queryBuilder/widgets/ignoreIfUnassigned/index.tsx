import React from 'react';
import { BaseWidget, BasicConfig, BooleanFieldSettings } from '@react-awesome-query-builder/antd';
import { Checkbox, Tooltip } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';

type IgnoreIfUnassignedWidgetType = BaseWidget & BooleanFieldSettings;

const defaultTooltip = 'Check this if you want the criteria to be ignored if the expression references any unassigned components.';

export const IgnoreIfUnassignedWidget: IgnoreIfUnassignedWidgetType = {
  ...BasicConfig.widgets.boolean,
  valueSrc: 'value',
  factory: (props) => {
    const checked = Boolean(props.value);
    const tooltipText = props.customProps?.title || defaultTooltip;

    return (
      <Tooltip title={tooltipText}>
        <span className="sha-query-builder-ignore-unassigned">
          <Checkbox
            checked={checked}
            disabled={props.readonly}
            onChange={(event) => props.setValue(event.target.checked)}
          />
          {checked && <DoubleRightOutlined className="sha-query-builder-ignore-unassigned-icon" />}
        </span>
      </Tooltip>
    );
  },
};
