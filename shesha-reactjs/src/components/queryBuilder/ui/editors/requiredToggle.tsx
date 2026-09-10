import React from 'react';
import classNames from 'classnames';
import { Checkbox, Tooltip } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';

export const SKIP_WHEN_EMPTY_TOOLTIP = 'Check this if you want the criteria to be ignored, if the expression references any unassigned components.';

interface RequiredToggleProps {
  /** The model flag: true means the rule must resolve before the query runs. The checkbox shows its inverse. */
  required: boolean;
  onChange: (required: boolean) => void;
  readOnly: boolean;
}

/** The issue's skip checkbox. Checked means `required = false`: the rule is ignored while its expression has no value. */
export const RequiredToggle: React.FC<RequiredToggleProps> = ({ required, onChange, readOnly }) => {
  const checked = !required;
  return (
    <Tooltip title={SKIP_WHEN_EMPTY_TOOLTIP} placement="right">
      <span className={classNames('sha-query-builder-ignore-unassigned', checked && 'is-checked')}>
        <Checkbox
          checked={checked}
          disabled={readOnly}
          onChange={(event) => onChange(!event.target.checked)}
          aria-label="Ignore this rule when the expression references unassigned components"
        />
        <DoubleRightOutlined className="sha-query-builder-ignore-unassigned-icon" />
      </span>
    </Tooltip>
  );
};
