import React, { FC } from 'react';
import IndexTableControls, { IIndexTableControlsProps } from '../indexTableControls';

export const TableControls: FC<IIndexTableControlsProps> = props => {
  return <IndexTableControls {...props} />;
};

export default TableControls;
