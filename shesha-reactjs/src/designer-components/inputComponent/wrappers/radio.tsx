import { IRadioSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { Radio } from 'antd';
import { useDefaultModelActionsOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';

export const RadioWrapper: FCUnwrapped<IRadioSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly = false, buttonGroupOptions, size, allowDeselect } = props;
  const defaultModel = useDefaultModelActionsOrUndefined();
  const onlyModel = isNotNullOrWhiteSpace(props.defaultModelPropertyName) ? defaultModel?.getValueInfo(props.defaultModelPropertyName)?.state === 'onlyModel' : true;
  const currentValueAdditionalInfo = (info: string | undefined): void => defaultModel?.setCurrentValueAdditionalInfo(props.defaultModelPropertyName ?? '', info);

  const handleClick = (clickedValue: string | number): void => {
    if ((allowDeselect ?? false) && value === clickedValue) {
      onChange?.(undefined);
    }
  };

  return (
    <Radio.Group
      value={value}
      onChange={(event) => {
        onChange?.(event.target.value);
      }}
      disabled={readOnly}
      buttonStyle="solid"
      size={size}
      className={styles.radioBtns}
    >
      {
        buttonGroupOptions?.map(({ value: optionValue, icon, title }) => {
          return (
            <Radio.Button
              key={optionValue}
              value={optionValue}
              onClick={() => handleClick(optionValue)}
              {...(!onlyModel ? { onMouseEnter: () => currentValueAdditionalInfo(title) } : {})}
            >
              {isDefined(icon) ? <Icon icon={icon} hint={onlyModel ? title : undefined} className={styles.icon} /> : title}
            </Radio.Button>
          );
        })
      }
    </Radio.Group>
  );
};
