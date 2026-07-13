import React, { FC } from 'react';
import { ColumnItemFilter } from '@/components/columnItemFilter';
import {
  IndexColumnFilterOption,
  ITableColumn,
  ColumnFilter,
  ITableFilter,
} from '@/providers/dataTable/interfaces';
import { getTableDataColumns } from '@/providers/dataTable/utils';
import { isDefined } from '@/utils/nullables';

export interface IColumnFiltersBaseProps {
  columns: ITableColumn[];
  currentFilter?: ITableFilter[] | undefined;
  changeFilterOption: (filterColumnId: string, filterOptionValue: IndexColumnFilterOption) => void;
  changeFilter: (filterColumnId: string, filterValue: ColumnFilter) => void;
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
  const filterableColumns = currentFilter
    ? getTableDataColumns(columns).filter((c) =>
      Boolean(currentFilter.find((f) => f.columnId === c.id)),
    )
    : [];

  return (
    <div style={{ flex: 1 }}>
      {filterableColumns.map(
        ({
          id,
          accessor,
          header,
          dataType,
          isFilterable,
          referenceListName,
          referenceListModule,
          entityTypeName,
          entityTypeModule,
        }) => {
          if (isFilterable) {
            const onRemoveFilter = (idOfFilter: string): void => {
              const newIds = currentFilter?.filter((f) => f.columnId !== idOfFilter).map((f) => f.columnId) ?? [];

              toggleColumnFilter(newIds);
            };

            const onChangeFilterOption = (filterId: string, fOption: IndexColumnFilterOption): void => {
              if (isDefined(changeFilterOption)) {
                changeFilterOption(filterId, fOption);
              }
            };

            const onChangeFilter = (filterId: string, fltr: ColumnFilter): void => {
              if (isDefined(changeFilter)) {
                changeFilter(filterId, fltr);
              }
            };

            const existingFilter = currentFilter?.find((f) => f.columnId === id);

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
                entityTypeName={entityTypeName}
                entityTypeModule={entityTypeModule}
                key={id}
              />
            );
          }

          return null;
        },
      )}
    </div>
  );
};

export default ColumnFiltersBase;
