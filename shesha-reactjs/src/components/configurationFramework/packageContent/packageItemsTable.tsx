import { DataTable } from '@/components/dataTable';
import { useDataTableStore } from '@/providers';
import React, { FC } from 'react';
import { PACKAGE_ITEMS_COLUMNS } from './models';
import { useEffectOnce } from 'react-use';

export interface IPackageItemsTableProps {
  onChangeSelection: (selectedKeys: string[]) => void;
}

export const PackageItemsTable: FC<IPackageItemsTableProps> = ({ onChangeSelection }) => {
  const store = useDataTableStore();
  useEffectOnce(() => {
    store.registerConfigurableColumns("", PACKAGE_ITEMS_COLUMNS);
  });

  return (
    <DataTable
      selectionMode="multiple"
      onSelectedIdsChanged={onChangeSelection}
      // rowDividers restores the horizontal separators between rows; the container border
      // restores the table's top/bottom frame. Both are otherwise stripped when no table
      // styling props are supplied (see reactTable row styles defaulting to border-bottom: none).
      rowDividers
      containerStyle={{ margin: 0, borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}
    />
  );
};
