import { ITextFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC, useMemo } from 'react';
import Icon from '@/components/icon/Icon';
import { useStyles } from '../styles';
import { Input } from 'antd';

export const TextFieldWrapper: FC<ITextFieldSettingsInputProps> = (props) => {
  const { value, readOnly, size, variant, placeholder, icon, textType, tooltip, label, width, onChange, regExp } = props;
  const { styles } = useStyles();

  const regExpObj = useMemo(() => {
    if (!regExp) return null;
    try {
      return new RegExp(regExp, 'g');
    } catch (error) {
      console.warn('Invalid regExp pattern:', regExp, error);
      return null;
    }
  }, [regExp]);

  return (
    <Input
      size={size}
      onChange={(e) => {
        const inputValue: string | undefined = e.target.value?.toString();
        if (regExpObj && inputValue)
          onChange(inputValue.replace(regExpObj, ''));
        else
          onChange(inputValue);
      }}
      readOnly={readOnly}
      variant={variant}
      placeholder={placeholder}
      style={{ width: width ?? "100%" }}
      suffix={<span style={{ height: '20px' }}><Icon icon={icon} hint={tooltip ?? label} className={styles.icon} /></span>}
      value={value}
      type={textType}
    />
  );
};
