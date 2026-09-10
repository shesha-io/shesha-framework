import React from 'react';
import { Checkbox, Tooltip } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';

export const SKIP_WHEN_EMPTY_TOOLTIP = 'Skip this rule when the expression resolves to nothing, for example when it refers to a field that has no value yet. When unchecked the query waits until the expression has a value.';

interface RequiredToggleProps {
  /** The model flag: true means the rule must resolve before the query runs. The checkbox shows its inverse. */
  required: boolean;
  onChange: (required: boolean) => void;
  readOnly: boolean;
}

/** "Skip when empty" checkbox. Checked means `required = false`, so the label, the tooltip and the flag agree. */
export const RequiredToggle: React.FC<RequiredToggleProps> = ({ required, onChange, readOnly }) => {
  const checked = !required;
  return (
    <Tooltip title={SKIP_WHEN_EMPTY_TOOLTIP} placement="right">
      <span className="sha-query-builder-ignore-unassigned">
        <Checkbox
          checked={checked}
          disabled={readOnly}
          onChange={(event) => onChange(!event.target.checked)}
        >
          Skip when empty
        </Checkbox>
        {checked && <DoubleRightOutlined className="sha-query-builder-ignore-unassigned-icon" />}
      </span>
    </Tooltip>
  );
};
