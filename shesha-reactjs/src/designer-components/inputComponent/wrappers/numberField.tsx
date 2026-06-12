import { INumberFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { InputNumber, Space } from 'antd';
import { isDefined } from '@/utils/nullables';

export const NumberFieldWrapper: FCUnwrapped<INumberFieldSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly = false, size, icon, variant, placeholder, tooltip, label, min, max } = props;

  return (
    <Space.Compact style={{ width: "100%" }}>
      <InputNumber
        {...(isDefined(value) ? { value } : {})}
        {...(isDefined(onChange) ? { onChange } : {})}
        readOnly={readOnly}
        placeholder={placeholder}
        {...(variant ? { variant } : {})}
        size={size}
        style={{ width: "100%" }}
        {...(isDefined(min) ? { min } : {})}
        {...(isDefined(max) ? { max } : {})}
        controls={!icon}
      />
      {icon && <Space.Addon><Icon icon={icon} hint={tooltip || (typeof label === 'string' ? label : undefined)} className={styles.icon} /></Space.Addon>}
    </Space.Compact>
  );
};
