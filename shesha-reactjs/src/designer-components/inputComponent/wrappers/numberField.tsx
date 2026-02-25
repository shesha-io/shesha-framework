import { INumberFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { InputNumber } from 'antd';

export const NumberFieldWrapper: FCUnwrapped<INumberFieldSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size, icon, variant, placeholder, tooltip, label, min, max } = props;

  return (
    <InputNumber
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      variant={variant}
      size={size}
      style={{ width: "100%" }}
      min={min}
      max={max}
      controls={!icon}
      addonAfter={icon ? <Icon icon={icon} hint={tooltip || label} className={styles.icon} /> : null}
    />
  );
};
