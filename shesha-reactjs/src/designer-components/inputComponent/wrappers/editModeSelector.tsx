import { IEditModeSelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import EditModeSelector from '@/components/editModeSelector';
import { useStyles } from '../styles';

export const EditModeSelectorWrapper: FC<IEditModeSelectorSettingsInputProps> = (props) => {
  const { styles } = useStyles();

  const { value, onChange, readOnly, size } = props;
  return (
    <EditModeSelector
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      size={size}
      className={styles.radioBtns}
    />
  );
};
