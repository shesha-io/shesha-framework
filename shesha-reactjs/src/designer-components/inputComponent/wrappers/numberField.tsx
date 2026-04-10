import { INumberFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { InputNumber, Space } from 'antd';

export const NumberFieldWrapper: FCUnwrapped<INumberFieldSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size, icon, variant, placeholder, tooltip, label, min, max } = props;

  return (
    <Space.Compact style={{ width: "100%" }}>
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
      />
      {icon && <Space.Addon><Icon icon={icon} hint={tooltip || (typeof label === 'string' ? label : undefined)} className={styles.icon} /></Space.Addon>}
    </Space.Compact>
  );
};
