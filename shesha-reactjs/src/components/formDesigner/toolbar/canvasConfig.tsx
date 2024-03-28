import React, { FC } from 'react';
import { DeskTopButton } from './desktopButton';
import { TabletButton } from './tabletButton';
import { DialogButton } from './dialogButton';
import { useStyles } from '../styles/styles';

export interface ICanvasConfigProps {

}

export const CanvasConfig: FC<ICanvasConfigProps> = () => {
    const { styles } = useStyles();
  return (
    <div className={styles.shaDesignerCanvasConfig}>
    <DeskTopButton/>
    <TabletButton/>
    <DialogButton/>


    </div>
  );
};