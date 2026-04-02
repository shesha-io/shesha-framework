import { ListEditor } from '@/components';
import { nanoid } from '@/utils/uuid';
import React, { FC } from 'react';
import { FilterItem } from './filterItem';
import { ListItem } from '@/components/listEditor/models';
import { IStoredFilter } from '@/interfaces';

export interface IFiltersListProps {
  value?: IStoredFilter[];
  onChange?: (newValue: IStoredFilter[]) => void;
  readOnly: boolean;
}

export const FiltersList: FC<IFiltersListProps> = ({ value, onChange, readOnly }) => {
  const makeNewFilter = (items: IStoredFilter[]): IStoredFilter => {
    const itemsCount = (items ?? []).length;
    const itemNo = itemsCount + 1;
    return {
      id: nanoid(),
      sortOrder: itemsCount,
      name: `Filter ${itemNo}`,
    } satisfies IStoredFilter;
  };

  const localOnChange = (newValue: IStoredFilter[]): void => {
    // Prevent removing the last filter - always ensure at least one filter exists
    if (newValue.length === 0) {
      const defaultFilter = {
        id: nanoid(),
        name: 'Default',
        tooltip: 'Shows all records without any filtering',
        sortOrder: 0,
        expression: null,
      };
      onChange([defaultFilter]);
    } else {
      onChange([...newValue]);
    }
  };

  return (
    <ListEditor<IStoredFilter & ListItem>
      value={value}
      onChange={localOnChange}
      initNewItem={makeNewFilter}
      readOnly={readOnly}
    >
      {({ item, itemOnChange, readOnly }) => (<FilterItem value={item} onChange={itemOnChange} readOnly={readOnly} />)}
    </ListEditor>
  );
};
