import { IButtonSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { Button } from 'antd';

export const ButtonWrapper: FCUnwrapped<IButtonSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, readOnly, size, icon, iconAlt, tooltip, tooltipAlt, onChange } = props;
  return (
    <Button
      icon={!value ? <Icon icon={icon} hint={tooltip} className={styles.icon} /> : <Icon icon={iconAlt || icon} hint={tooltipAlt || tooltip} className={styles.icon} />}
      onClick={() => onChange(!value)}
      disabled={readOnly}

      style={{ maxWidth: "100%" }}
      type={value === true ? 'primary' : 'default'}
      size={size}
    />
  );
};
