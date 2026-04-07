import { IThreeStateSwitchSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useStyles } from '../styles';
import ThreeStateSwitch from '@/components/threeStateSwitch';

export const ThreeStateSwitchWrapper: FCUnwrapped<IThreeStateSwitchSettingsInputProps> = ({ value, onChange, readOnly, size }) => {
  const { styles } = useStyles();

  return (
    <ThreeStateSwitch
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      size={size}
      className={styles.radioBtns}
    />
  );
};
