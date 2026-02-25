import { INumberFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { InputNumber } from 'antd';

export const NumberFieldWrapper: FC<INumberFieldSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size, icon, variant, placeholder, tooltip, label, min, max, metadataValue } = props;

  const [focused, setFocused] = React.useState(false);
  const localValue = !focused && (value === undefined || value === null || value === '') ? metadataValue : value;

  return (
    <InputNumber
      value={localValue}
      onChange={onChange}
      readOnly={readOnly}

      placeholder={placeholder ?? metadataValue?.toString()}
      variant={variant}
      size={size}
      style={{ width: "100%" }}
      min={min}
      max={max}
      controls={!icon}
      addonAfter={icon ? <Icon icon={icon} hint={tooltip || label} className={styles.icon} /> : null}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};
