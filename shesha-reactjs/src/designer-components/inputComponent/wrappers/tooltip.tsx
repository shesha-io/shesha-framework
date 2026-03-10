import { ITooltipSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';

export const TooltipWrapper: FC<ITooltipSettingsInputProps> = ({ icon, tooltip }) => {
  const { styles } = useStyles();
  return <Icon icon={icon} hint={tooltip} className={styles.icon} />;
};
