import { ListEditor } from '@/components';
import { ITableViewProps } from '@/providers/dataTable/filters/models';
import { nanoid } from '@/utils/uuid';
import React, { FC } from 'react';
import { FilterItem } from './filterItem';
import { ListItem } from '@/components/listEditor/models';

export interface IFiltersListProps {
  value?: ITableViewProps[];
  onChange?: (newValue: ITableViewProps[]) => void;
  readOnly: boolean;
}

export const FiltersList: FC<IFiltersListProps> = ({ value, onChange, readOnly }) => {
  const makeNewFilter = (items: ITableViewProps[]): ITableViewProps => {
    const itemsCount = (items ?? []).length;
    const itemNo = itemsCount + 1;
    return {
      id: nanoid(),
      sortOrder: itemsCount,
      name: `Filter ${itemNo}`,
    } satisfies ITableViewProps;
  };

  const localOnChange = (newValue: ITableViewProps[]): void => {
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
    <ListEditor<ITableViewProps & ListItem>
      value={value}
      onChange={localOnChange}
      initNewItem={makeNewFilter}
      readOnly={readOnly}
    >
      {({ item, itemOnChange, readOnly }) => (<FilterItem value={item} onChange={itemOnChange} readOnly={readOnly} />)}
    </ListEditor>
  );
};
