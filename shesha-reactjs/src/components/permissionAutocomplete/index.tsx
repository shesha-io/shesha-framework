import React, { FC, useState } from 'react';
import { Select } from 'antd';
import { PermissionsTree } from '@/components/permissionsTree';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IPermissionAutocompleteProps {
  onChange?: ((value: string[]) => void) | undefined;
  value?: string[] | undefined;
  readOnly?: boolean | undefined;
  size?: SizeType | undefined;
}

const dropdownStyles = { popup: { root: { maxHeight: '50%', overflow: 'auto' } } };

export const PermissionAutocomplete: FC<IPermissionAutocompleteProps> = (props) => {
  const { onChange, value, readOnly, size } = props;

  const [searchText, setSearchText] = useState('');

  const internalOnChange = (values: string[] | null): void => {
    // setSearchText('');
    if (onChange) {
      onChange(values ?? []);
    }
  };

  return (
    <Select
      style={{ width: '100%' }}
      mode="multiple"
      allowClear
      showSearch={{
        onSearch: setSearchText,
        searchValue: searchText,
      }}
      disabled={readOnly ?? false}
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
      value={value ?? null}
    />
  );
};
