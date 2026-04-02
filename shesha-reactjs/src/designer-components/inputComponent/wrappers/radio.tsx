import { IRadioSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { Radio } from 'antd';

export const RadioWrapper: FCUnwrapped<IRadioSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, buttonGroupOptions, size, allowDeselect } = props;

  const handleClick = (clickedValue: string | number): void => {
    if (allowDeselect && value === clickedValue) {
      onChange?.(undefined);
    }
  };

  return (
    <Radio.Group
      value={value}
      onChange={onChange}
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
            >
              {icon ? <Icon icon={icon || title} hint={title} className={styles.icon} /> : title}
            </Radio.Button>
          );
        })
      }
    </Radio.Group>
  );
};
