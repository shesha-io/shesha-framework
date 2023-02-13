import React, { FC } from 'react';
import { ToolboxComponents } from './toolboxComponents';
import { ToolboxDataSources } from './toolboxDataSources';

export interface IProps {}

const Toolbox: FC<IProps> = () => {
  return (
    <div className="sha-designer-toolbox">
      <ToolboxComponents />
      <ToolboxDataSources />
    </div>
  );
};

export default Toolbox;
