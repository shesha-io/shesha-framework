import { Empty } from 'antd';
import React, { FC } from 'react';

export interface INoSelectionProps {
  message?: string;
  readOnly: boolean;
}

export const NoSelection: FC<INoSelectionProps> = ({ message, readOnly }) => {
  const description = message ?? readOnly ? 'Please select an item to view properties' : 'Please select an item to begin editing';
  return (
    <div>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={description}
      />
    </div>
  );
};
