import { IThreeStateSwitchSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useStyles } from '../styles';
import ThreeStateSwitch from '@/components/threeStateSwitch';

export const ThreeStateSwitchWrapper: FC<IThreeStateSwitchSettingsInputProps> = ({ value, onChange, readOnly, size, metadataValue }) => {
  const { styles } = useStyles();

  return (
    <ThreeStateSwitch
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      size={size}
      className={styles.radioBtns}
      defaultValue={metadataValue as boolean | undefined}
    />
  );
};
