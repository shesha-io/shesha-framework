import { IEditModeSelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { useMemo } from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import EditModeSelector from '@/components/editModeSelector';
import { useStyles } from '../styles';
import { useDefaultModelActionsOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

export const EditModeSelectorWrapper: FCUnwrapped<IEditModeSelectorSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size, interactionType } = props;
  const defaultModel = useDefaultModelActionsOrUndefined();
  const onlyModel = isNotNullOrWhiteSpace(props.defaultModelPropertyName) ? defaultModel?.getValueInfo(props.defaultModelPropertyName)?.state === 'onlyModel' : true;

  const currentValueAdditionalInfo = useMemo(() => onlyModel ? undefined : (info: string) => defaultModel?.setCurrentValueAdditionalInfo(props.propertyName, info),
    [onlyModel, defaultModel, props.propertyName]);

  return (
    <EditModeSelector
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      onGetAdditionalInfo={currentValueAdditionalInfo}
      size={size}
      className={styles.radioBtns}
      interactionType={interactionType ?? 'full'}
    />
  );
};
