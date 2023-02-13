import React, { FC } from 'react';
import { ColumnItemFilter } from '../columnItemFilter';
import {
  IndexColumnFilterOption,
  ITableColumn,
  ColumnFilter,
  ITableFilter,
} from '../../providers/dataTable/interfaces';

export interface IColumnFiltersBaseProps {
  columns: ITableColumn[];
  currentFilter?: ITableFilter[];
  changeFilterOption: (filterColumnId: string, filterOptionValue: IndexColumnFilterOption) => void;
  changeFilter: (filterColumnId: string, filterValue: any) => void;
  toggleColumnFilter: (columnIds: string[]) => void;
  applyFilters: () => void;
}

export const ColumnFiltersBase: FC<IColumnFiltersBaseProps> = ({
  columns,
  changeFilterOption,
  changeFilter,
  toggleColumnFilter,
  applyFilters,
  currentFilter,
}) => {
  const filterableColumns = columns.filter(c => Boolean(currentFilter.find(f => f.columnId === c.id)));

  return (
    <div className="sha-column-filters">
      {filterableColumns.map(
        ({
          id,
          accessor,
          header,
          dataType,
          isFilterable,
          referenceListName,
          referenceListModule,
          entityReferenceTypeShortAlias,
        }) => {
          if (isFilterable) {
            const onRemoveFilter = (idOfFilter: string) => {
              const newIds = currentFilter.filter(f => f.columnId !== idOfFilter).map(f => f.columnId);

              toggleColumnFilter(newIds);
            };

            const onChangeFilterOption = (filterId: string, fOption: IndexColumnFilterOption) => {
              if (changeFilterOption) {
                changeFilterOption(filterId, fOption);
              }
            };

            const onChangeFilter = (filterId: string, fltr: ColumnFilter) => {
              if (changeFilter) {
                changeFilter(filterId, fltr);
              }
            };

            const existingFilter = currentFilter.find(f => f.columnId === id);

            return (
              <ColumnItemFilter
                onRemoveFilter={onRemoveFilter}
                onChangeFilterOption={onChangeFilterOption}
                onChangeFilter={onChangeFilter}
                
                id={id}
                filterName={header}
                accessor={accessor}
                dataType={dataType}
                filter={existingFilter?.filter}
                filterOption={existingFilter?.filterOption}
                applyFilters={applyFilters}
                referenceListName={referenceListName}
                referenceListModule={referenceListModule}
                entityReferenceTypeShortAlias={entityReferenceTypeShortAlias}
                
                key={id}
              />
            );
          }

          return null;
        }
      )}
    </div>
  );
};

export default ColumnFiltersBase;
