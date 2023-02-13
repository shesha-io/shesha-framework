import React, { FC } from 'react';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import classNames from 'classnames';
import { useEntityAutocomplete } from '../../utils/autocomplete';
import { EntityData } from '../../interfaces/gql';

export interface IAutocompleteResultItem {
  value: string;
  displayText: string;
}

export interface IEntityDropdownProps extends SelectProps<any> {
  typeShortAlias: string;
  allowInherited?: boolean;
  selectedValue?: string;
  filter?: string;
  lazy?: boolean;
}

export const EntityDropdown: FC<IEntityDropdownProps> = ({
  selectedValue,
  typeShortAlias,
  className,
  lazy = false,
  filter,
  ...rest
}) => {
  const { data, loading, search } = useEntityAutocomplete({
    entityType: typeShortAlias,
    value: selectedValue,
    filter,
    lazy,
  });

  const handleSearch = (term: string) => {
    if (term) {
      search(term);
    }
  };

  const dataLoaded = data && data.length > 0;

  return (
    <Select
      style={{ width: '100%' }}
      showSearch
      defaultActiveFirstOption={false}
      filterOption={false}
      onSearch={handleSearch}
      // onSelect={fetchDefaultList}
      allowClear={true}
      placeholder="Type to search"
      loading={loading}
      className={classNames(className, 'sha-entity-dropdown')}
      {...rest}
    >
      {dataLoaded &&
        data.map((d: EntityData) => (
          <Select.Option value={d.id} key={d.id}>
            {d._displayName}
          </Select.Option>
        ))}
    </Select>
  );
};

export default EntityDropdown;
