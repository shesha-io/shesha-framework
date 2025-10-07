import React, { FC } from 'react';
import { Button } from 'antd';
import { SlidersOutlined } from '@ant-design/icons';
import { useDataTableStore } from '@/providers';

export const SelectColumnsButton: FC = ({ }) => {
  const {
    isInProgress: { isSelectingColumns },
    setIsInProgressFlag,
  } = useDataTableStore();

  const startTogglingColumnVisibility = (): void => setIsInProgressFlag({ isSelectingColumns: true, isFiltering: false });

  return (
    <Button
      type="link"
      className="extra-btn column-visibility"
      icon={<SlidersOutlined rotate={90} />}
      disabled={!!isSelectingColumns}
      onClick={startTogglingColumnVisibility}
      size="small"
    />
  );
};
