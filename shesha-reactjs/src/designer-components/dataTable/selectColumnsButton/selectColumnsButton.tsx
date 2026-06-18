import React, { FC } from 'react';
import { Button } from 'antd';
import { SlidersOutlined } from '@ant-design/icons';
import { useDataTableStore } from '@/providers';

export const SelectColumnsButton: FC = ({ }) => {
  const {
    isColumnsSelectorVisible,
    toggleColumnsSelector,
  } = useDataTableStore();

  const startTogglingColumnVisibility = (): void => toggleColumnsSelector(true);

  return (
    <Button
      type="link"
      className="extra-btn column-visibility"
      icon={<SlidersOutlined rotate={90} />}
      disabled={isColumnsSelectorVisible}
      onClick={startTogglingColumnVisibility}
      size="small"
    />
  );
};
