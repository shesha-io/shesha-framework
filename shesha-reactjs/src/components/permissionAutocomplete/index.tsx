import React, { FC, useState } from 'react';
import { Select } from 'antd';
import { PermissionsTree } from '@/components/permissionsTree';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IPermissionAutocompleteProps {
  onChange?: (value: string[]) => void;
  value?: string[];
  readOnly?: boolean;
  size?: SizeType;
}

const dropdownStyles = { popup: { root: { maxHeight: '50%', overflow: 'auto' } } };

export const PermissionAutocomplete: FC<IPermissionAutocompleteProps> = (props) => {
  const { onChange, value, readOnly, size } = props;

  const [searchText, setSearchText] = useState('');

  const internalOnChange = (values?: string[]): void => {
    // setSearchText('');
    if (onChange) {
      onChange(values);
    }
  };

  return (
    <Select
      style={{ width: '100%' }}
      mode="multiple"
      allowClear
      onSearch={setSearchText}
      searchValue={searchText}
      disabled={readOnly}
      size={size}
      styles={dropdownStyles}
      popupRender={(_) => (

        <PermissionsTree
          formComponentId=""
          formComponentName=""
          mode="Select"
          hideSearch
          readOnly={readOnly}

          searchText={searchText}
          onChange={internalOnChange}
          value={value}
        />
      )}
      onChange={internalOnChange}
      value={value}
    />
  );
};
