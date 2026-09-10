import React from 'react';
import { Select } from 'antd';
import { Conjunction } from '../model/types';

const OPTIONS: Array<{ value: Conjunction; label: string }> = [
  { value: 'and', label: 'And' },
  { value: 'or', label: 'Or' },
];

const stopPointerPropagation = (event: React.MouseEvent | React.PointerEvent): void => {
  event.stopPropagation();
};

interface RelationPrefixProps {
  isFirst: boolean;
  readOnly: boolean;
  value: Conjunction;
  onChange: (value: Conjunction) => void;
}

/** "Where" on the first row of a group; the group's and/or on the rest. Changing it changes the whole group. */
export const RelationPrefix: React.FC<RelationPrefixProps> = ({ isFirst, onChange, readOnly, value }) => {
  if (isFirst)
    return <span className="sha-query-builder-prefix-label">Where</span>;

  return (
    <div
      className="sha-query-builder-prefix-select"
      onMouseDown={stopPointerPropagation}
      onPointerDown={stopPointerPropagation}
    >
      <Select
        value={value}
        options={OPTIONS}
        onChange={onChange}
        variant="borderless"
        disabled={readOnly}
        popupMatchSelectWidth={false}
        size="small"
      />
    </div>
  );
};
