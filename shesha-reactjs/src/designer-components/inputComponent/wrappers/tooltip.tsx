import { ITooltipSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';

export const TooltipWrapper: FCUnwrapped<ITooltipSettingsInputProps> = ({ icon, tooltip }) => {
  const { styles } = useStyles();
  return <Icon icon={icon} hint={tooltip} className={styles.icon} />;
};
