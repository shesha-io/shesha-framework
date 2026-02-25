import { ITextFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC, useMemo } from 'react';
import Icon from '@/components/icon/Icon';
import { useStyles } from '../styles';
import { Input } from 'antd';

export const TextFieldWrapper: FC<ITextFieldSettingsInputProps> = (props) => {
  const { value, readOnly, size, variant, placeholder, metadataValue, icon, textType, tooltip, label, width, onChange, regExp } = props;
  const { styles } = useStyles();

  const [focused, setFocused] = React.useState(false);
  const localValue = !focused && !value ? metadataValue : value;

  const regExpObj = useMemo(() => {
    if (!regExp) return null;
    try {
      return new RegExp(regExp, 'g');
    } catch (error) {
      console.warn(`Invalid regExp pattern for '${props.propertyName}':`, regExp, error);
      return null;
    }
  }, [regExp]);

  return (
    <Input
      size={size}
      onChange={(e) => {
        const inputValue: string | undefined = e.target.value?.toString();
        const isEmpty = inputValue === undefined || inputValue === null || inputValue === '';
        const isRegExpMatch = regExpObj && Boolean(inputValue?.match(regExpObj));
        if ((!isEmpty && isRegExpMatch) || !regExpObj || isEmpty) {
          onChange(inputValue);
        } else {
          // Workaround because if the value is undefined, input component leave the inputed value
          // Rendering of the component is not called
          // And there is a discrepancy - the value is undefined, but the some text is displayed in the component
          if (Boolean(regExpObj) && value === undefined && typeof onChange === 'function') {
            onChange('');
          }
        }
      }}
      readOnly={readOnly}
      variant={variant}
      placeholder={placeholder ?? metadataValue?.toString()}
      style={{ width: width ?? "100%" }}
      suffix={<span style={{ height: '20px' }}><Icon icon={icon} hint={tooltip ?? label} className={styles.icon} /></span>}
      value={localValue}
      type={textType}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};
