import { IDropdownSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import { Select } from 'antd';

export const DropDownWrapper: FC<IDropdownSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size, width, dropdownOptions, dropdownMode, allowClear, variant, className, showSearch, placeholder, tooltip } = props;
  const resolvedOptions = Array.isArray(dropdownOptions) ? dropdownOptions : (dropdownOptions?._value ?? []);
  const options = resolvedOptions.map((option) => ({ ...option, label: <Icon icon={option.label} size={option.value} className={styles.icon} hint={tooltip} /> }));
  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={readOnly}
      size={size}
      mode={dropdownMode}
      allowClear={allowClear ?? true}
      variant={variant}
      className={className}
      showSearch={showSearch}
      style={{ width: width ?? "100%" }}
      placeholder={placeholder}
      options={options}
    />
  );
};
