import React from 'react';
import classNames from 'classnames';
import { Checkbox, Tooltip } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';
import { QUERY_BUILDER_DOC_URL } from '../../constants';
import { useStyles } from '../../styles/styles';

export const SKIP_WHEN_EMPTY_TOOLTIP = 'Check this if you want the criteria to be ignored, if the expression references any unassigned components.';

interface RequiredToggleProps {
  /** The model flag: true means the rule must resolve before the query runs. The checkbox shows its inverse. */
  required: boolean;
  onChange: (required: boolean) => void;
  readOnly: boolean;
}

const HintCard: React.FC = () => (
  <div>
    <span className="sha-query-builder-hint-title">Hint:</span>
    <p className="sha-query-builder-hint-body">{SKIP_WHEN_EMPTY_TOOLTIP}</p>
    <p className="sha-query-builder-hint-link">
      <a href={QUERY_BUILDER_DOC_URL} target="_blank" rel="noopener noreferrer">See component documentation</a> for setup and usage.
    </p>
  </div>
);

/** The issue's skip checkbox. Checked means `required = false`: the rule is ignored while its expression has no value. */
export const RequiredToggle: React.FC<RequiredToggleProps> = ({ required, onChange, readOnly }) => {
  const { styles } = useStyles();
  const checked = !required;
  return (
    <Tooltip title={<HintCard />} placement="right" color="#fff" classNames={{ root: styles.shaQueryBuilderHint }}>
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
