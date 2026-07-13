import { IDropdownOption, IDropdownSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { isDefined } from '@/utils/nullables';
import Icon from '@/components/icon/Icon';

const renderOptionLabel = (option: IDropdownOption): React.ReactNode => {
  if (!isDefined(option.icon))
    return option.label;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Icon icon={option.icon} />
      {option.label}
    </span>
  );
};

export const DropDownWrapper: FCUnwrapped<IDropdownSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, width, dropdownOptions, dropdownMode, allowClear, variant, className, showSearch, placeholder } = props;
  const options: DefaultOptionType[] = (Array.isArray(dropdownOptions) ? dropdownOptions : [])
    .map((option) => ({ value: option.value, label: renderOptionLabel(option) }));
  return (
    <Select
      value={value}
      {...(onChange ? { onChange } : {})}
      disabled={readOnly ?? false}
      size={size}
      {...(dropdownMode ? { mode: dropdownMode } : {})}
      allowClear={allowClear ?? true}
      {...(variant ? { variant } : {})}
      {...(className ? { className } : {})}
      showSearch={showSearch ?? false}
      style={{ width: width ?? "100%" }}
      placeholder={placeholder}
      options={options}
    />
  );
};
