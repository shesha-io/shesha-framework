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
      containerStyle={{ margin: 0 }}
    />
  );
};
