import React, { FC, useEffect } from 'react';
import { TableViewSelectorConfiguratorProvider, useTableViewSelectorConfigurator } from '../../../../../providers';
import { ITableViewProps } from '../../../../../providers/tableViewSelectorConfigurator/models';
import TableViewContainer from './tableViewContainer';

interface IFiltersListProps {
  filters?: ITableViewProps[];
  onSelectedIdChanged?: (selectedFilterId: string) => void;
}

const FiltersListInner: FC<Omit<IFiltersListProps, 'filters'>> = ({ onSelectedIdChanged }) => {
  const { items, selectedItemId } = useTableViewSelectorConfigurator();

  useEffect(() => {
    if (onSelectedIdChanged && selectedItemId) {
      onSelectedIdChanged(selectedItemId);
    }
  }, [selectedItemId]);

  return <TableViewContainer items={items} index={[]} />;
};

const FiltersList: FC<IFiltersListProps> = ({ filters, ...rest }) => {
  return (
    <TableViewSelectorConfiguratorProvider items={filters || []}>
      <FiltersListInner {...rest} />
    </TableViewSelectorConfiguratorProvider>
  );
};

export default FiltersList;
