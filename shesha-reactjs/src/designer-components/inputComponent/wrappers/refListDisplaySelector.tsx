import RefListDisplaySelector from '@/components/refListDisplaySelector';
import { useDefaultModelActionsOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { IRefListDisplaySelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FCUnwrapped } from '@/providers/form/models';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';
import { useMemo } from 'react';
import { useStyles } from '../styles';

export const RefListDisplaySelectorWrapper: FCUnwrapped<IRefListDisplaySelectorSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size } = props;
  const defaultModel = useDefaultModelActionsOrUndefined();
  const onlyModel = isNotNullOrWhiteSpace(props.defaultModelPropertyName)
    ? defaultModel?.getValueInfo(props.defaultModelPropertyName)?.state === 'onlyModel'
    : true;

  const currentValueAdditionalInfo = useMemo(
    () => onlyModel ? undefined : (info: string) => defaultModel?.setCurrentValueAdditionalInfo(props.propertyName, info),
    [onlyModel, defaultModel, props.propertyName],
  );

  return (
    <RefListDisplaySelector
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      onGetAdditionalInfo={currentValueAdditionalInfo}
      size={size}
      className={styles.radioBtns}
    />
  );
};
