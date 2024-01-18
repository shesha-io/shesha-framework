import React, { FC } from 'react';
import { ToolboxComponents } from './toolboxComponents';
import { ToolboxDataSources } from './toolboxDataSources';
import { useStyles } from './styles/styles';

export interface IProps {}

const Toolbox: FC<IProps> = () => {
  const { styles }  = useStyles();
  return (
    <div className={styles.shaDesignerToolbox}>
      <ToolboxComponents />
      <ToolboxDataSources />
    </div>
  );
};

export default Toolbox;
