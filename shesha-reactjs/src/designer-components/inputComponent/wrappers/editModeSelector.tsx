import { IEditModeSelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { useMemo } from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import EditModeSelector from '@/components/editModeSelector';
import { useStyles } from '../styles';
import { useDefaultModelActionsOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';

export const EditModeSelectorWrapper: FCUnwrapped<IEditModeSelectorSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size } = props;
  const defaultModel = useDefaultModelActionsOrUndefined();
  const currentValueAdditionalInfo = useMemo(() => (info: string) => defaultModel?.setCurrentValueAdditionalInfo(props.propertyName, () => info),
    [defaultModel, props.propertyName]);

  return (
    <EditModeSelector
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      onGetAdditionalInfo={currentValueAdditionalInfo}
      size={size}
      className={styles.radioBtns}
    />
  );
};
