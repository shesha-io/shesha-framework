import { IDropdownSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { Select } from 'antd';
import { isDefined } from '@/utils/nullables';

export const DropDownWrapper: FCUnwrapped<IDropdownSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, width, dropdownOptions, dropdownMode, allowClear, variant, className, showSearch, placeholder } = props;
  const options = isDefined(dropdownOptions) ? dropdownOptions : [];
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
