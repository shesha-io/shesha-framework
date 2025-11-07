import { ITextFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import Icon from '@/components/icon/Icon';
import { useStyles } from '../styles';
import { Input } from 'antd';

export const TextFieldWrapper: FC<ITextFieldSettingsInputProps> = (props) => {
  const { value, readOnly, size, variant, placeholder, icon, textType, tooltip, width, onChange } = props;
  const { styles } = useStyles();
  return (
    <Input
      size={size}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      variant={variant}
      placeholder={placeholder}
      style={{ width: width ?? "100%" }}
      suffix={<span style={{ height: '20px' }}><Icon icon={icon} hint={tooltip} className={styles.icon} /></span>}
      value={value}
      type={textType}
    />
  );
};
