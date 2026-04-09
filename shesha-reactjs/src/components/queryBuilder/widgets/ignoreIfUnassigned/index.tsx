import React from 'react';
import { BaseWidget, BasicConfig, BooleanFieldSettings } from '@react-awesome-query-builder/antd';
import { Checkbox, Tooltip } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';
import { ignoreIfUnassignedTooltip } from './constants';

type IgnoreIfUnassignedWidgetType = BaseWidget & BooleanFieldSettings;

export const IgnoreIfUnassignedWidget: IgnoreIfUnassignedWidgetType = {
  ...BasicConfig.widgets.boolean,
  valueSrc: 'value',
  factory: (props) => {
    const checked = Boolean(props.value);
    const tooltipText = (props.customProps?.title as React.ReactNode) || ignoreIfUnassignedTooltip;

    return (
      <Tooltip title={tooltipText} placement="right">
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
