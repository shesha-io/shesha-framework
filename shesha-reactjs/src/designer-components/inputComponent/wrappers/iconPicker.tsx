import { IIconPickerSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { useAvailableConstantsData } from '@/providers/form/utils';
import React, { FC } from 'react';
import { IconPickerWrapper as IconPicker } from '../../iconPicker/iconPickerWrapper';

export const IconPickerWrapper: FC<IIconPickerSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, iconSize } = props;
  const allData = useAvailableConstantsData();

  return (
    <IconPicker
      iconSize={iconSize ?? 20}
      selectBtnSize={size}
      value={value}
      readOnly={readOnly}
      onChange={onChange}
      applicationContext={allData}
    />
  );
};
