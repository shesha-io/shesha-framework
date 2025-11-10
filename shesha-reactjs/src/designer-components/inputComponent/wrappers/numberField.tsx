import { INumberFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { InputNumber } from 'antd';

export const NumberFieldWrapper: FC<INumberFieldSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size, icon, variant, placeholder, tooltip, label, min } = props;
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
      controls={!icon}
      addonAfter={icon ? <Icon icon={icon} hint={tooltip || label} className={styles.icon} /> : null}
    />
  );
};
