import React, { FC, useMemo } from 'react';
import { PackageAnalyzeResult } from '../itemsImport/models';
import { DataTableProvider } from '@/providers';
import { PackageItemsTable } from './packageItemsTable';
import GlobalTableFilter from '@/components/globalTableFilter';
import TablePager from '@/components/tablePager';
import { useMetadataBuilderFactory } from '@/utils/metadata';
import { IObjectMetadata } from '@/interfaces/metadata';

export interface IPackageContentProps {
  packageState: PackageAnalyzeResult;
  onChangeSelection: (selectedKeys: string[]) => void;
}

export const PackageContent: FC<IPackageContentProps> = ({ packageState, onChangeSelection }) => {
  const getFieldValue = (propertyName: string): any => {
    return packageState[propertyName];
  };

  const metadataBuilderFactory = useMetadataBuilderFactory();
  const metadata = useMemo<IObjectMetadata>(() => {
    const metadataBuilder = metadataBuilderFactory();
    const meta = metadataBuilder.object("row")
      .addString("baseModule", "Base Module")
      .addString("overrideModule", "Override Module")
      .addString("name", "Name")
      .addString("type", "Type")
      .addDateTime("dateUpdated", "Date Updated")
      .build();
    return meta;
  }, [metadataBuilderFactory]);

  return (
    <div>
      <DataTableProvider
        sourceType="Form"
        dataFetchingMode="paging"

        getFieldValue={getFieldValue}
        propertyName="items"
        metadata={metadata}
      >
        <GlobalTableFilter block style={{ margin: '8px 0' }} searchProps={{ size: 'middle', autoFocus: true }} />
        <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'center', padding: '8px 0' }}>
          <TablePager />
        </div>
        <PackageItemsTable onChangeSelection={onChangeSelection} />
      </DataTableProvider>
    </div>
  );
};
