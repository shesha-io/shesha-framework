import { ICustomDropdownSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useStyles } from '../styles';
import Icon from '@/components/icon/Icon';
import CustomDropdown from '@/designer-components/_settings/utils/CustomDropdown';

export const CustomDropdownWrapper: FC<ICustomDropdownSettingsInputProps> = (props) => {
  const { styles } = useStyles();
  const { value, onChange, readOnly, size, dropdownOptions, customTooltip, placeholder, tooltip } = props;
  const options = dropdownOptions.map((option) => ({ ...option, label: <Icon icon={option.label} hint={tooltip} className={styles.icon} /> }));

  return (
    <CustomDropdown
      value={value}
      onChange={onChange}
      readOnly={readOnly}

      placeholder={placeholder}
      options={options}
      size={size}
      customTooltip={customTooltip}
    />
  );
};
