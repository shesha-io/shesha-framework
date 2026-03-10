import { IThreeStateSwitchSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useStyles } from '../styles';
import ThreeStateSwitch from '@/components/threeStateSwitch';

export const ThreeStateSwitchWrapper: FC<IThreeStateSwitchSettingsInputProps> = (props) => {
  const { styles } = useStyles();

  const { value, onChange, readOnly, size } = props;
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
