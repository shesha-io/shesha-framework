import { IModelMetadata, isJsonEntityMetadata, isObjectMetadata } from "@/interfaces/metadata";
import { IHasFormDataSourceConfig, useMetadataDispatcher } from "@/providers";
import { IConfigurableColumnsProps, isDataColumn } from "@/providers/datatableColumnsConfigurator/models";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { unsafeGetValueByPropertyName } from "@/utils/object";
import React, { FC, PropsWithChildren, useCallback, useMemo } from "react";
import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse, ITableRowData } from "../interfaces";
import { DataTableProviderWithRepository, IDataTableProviderWithRepositoryProps } from "../provider";
import { IRepository, RowsReorderPayload, SupportsReorderingArgs } from "./interfaces";

export interface IWithInMemoryRepositoryArgs {
  valueAccessor: () => ITableRowData[];
  onChange: (value: ITableRowData[]) => void;
  metadata?: IModelMetadata | undefined;
  metadataDispatcher: IMetadataDispatcher;
}

type FilterRowsArgs = Pick<IGetListDataPayload, 'quickSearch' | 'columns'> & {
  rows: ITableRowData[];
};
const filterRows = ({ rows, columns, quickSearch }: FilterRowsArgs): ITableRowData[] => {
  if (!quickSearch)
    return rows;
  const lowerQuickSearch = quickSearch.toLowerCase();

  return rows.filter((row) => {
    return columns.some((col) => {
      if (!col.propertyName)
        return false;

      const value = unsafeGetValueByPropertyName(row, col.propertyName);
      return value && typeof (value) === 'string' && value.toLowerCase().includes(lowerQuickSearch);
    });
  });
};


type ApplyPagingArgs = Pick<IGetListDataPayload, 'currentPage' | 'pageSize'> & Pick<ITableDataInternalResponse, 'totalRowsBeforeFilter'>;
const applyPaging = (rows: ITableRowData[], { pageSize, currentPage, totalRowsBeforeFilter }: ApplyPagingArgs): ITableDataInternalResponse => {
  if (pageSize < 0)
    return {
      rows: rows,
      totalPages: rows.length > 0 ? 1 : 0,
      totalRows: rows.length,
      totalRowsBeforeFilter,
    };

  // apply pagination
  let startIndex = (currentPage - 1) * pageSize;
  if (startIndex > rows.length - 1)
    startIndex = 0;

  const endIndex = startIndex + pageSize <= rows.length
    ? startIndex + pageSize
    : rows.length;

  return {
    totalPages: Math.ceil(rows.length / pageSize),
    totalRows: rows.length,
    totalRowsBeforeFilter: totalRowsBeforeFilter,
    rows: rows.slice(startIndex, endIndex),
  };
};

const createRepository = (args: IWithInMemoryRepositoryArgs): IRepository => {
  const fetch = (payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {
    const { currentPage, pageSize, columns, quickSearch /* , columns, filter,  sorting*/ } = payload;

    const allRows = args.valueAccessor();

    // apply filter
    let filteredRows = filterRows({ rows: allRows, quickSearch, columns });

    // apply sorting

    // apply pagination
    const pagedResponse = applyPaging(filteredRows, { pageSize, currentPage, totalRowsBeforeFilter: allRows.length });

    return Promise.resolve(pagedResponse);
  };

  const prepareColumns = async (configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
    const converted: DataTableColumnDto[] = [];

    const { metadata, metadataDispatcher } = args;
    for (const col of configurableColumns) {
      if (isDataColumn(col)) {
        const convertedDataCol: DataTableColumnDto = {
          propertyName: col.propertyName,
          name: col.propertyName,
          caption: col.caption,
          description: null,
          dataType: 'string',
          dataFormat: null,
          referenceListName: null,
          referenceListModule: null,
          entityTypeName: null,
          allowInherited: false, // TODO: add to metadata
          isFilterable: true, // TODO: add to metadata
          isSortable: true, // TODO: add to metadata
        };
        if (isJsonEntityMetadata(metadata) || isObjectMetadata(metadata)) {
          const propertyMeta = await metadataDispatcher.getPropertyFromMetadata({ metadata, propertyPath: col.propertyName });
          if (propertyMeta) {
            convertedDataCol.dataType = propertyMeta.dataType;
            convertedDataCol.dataFormat = propertyMeta.dataFormat ?? null;
            convertedDataCol.metadata = propertyMeta;
            convertedDataCol.referenceListModule = propertyMeta.referenceListModule ?? null;
            convertedDataCol.referenceListName = propertyMeta.referenceListName ?? null;
          }
        }

        converted.push(convertedDataCol);
      }
    }

    return converted;
  };

  const performUpdate = <TData extends ITableRowData = ITableRowData>(rowIndex: number, data: TData): Promise<TData> => {
    const newRows = [...args.valueAccessor()];
    newRows[rowIndex] = data;
    args.onChange(newRows);

    return Promise.resolve(data);
  };

  const performDelete = <TData extends object = object>(rowIndex: number, data: TData): Promise<TData> => {
    const newRows = [...args.valueAccessor()];
    newRows.splice(rowIndex, 1);
    args.onChange(newRows);

    return Promise.resolve(data);
  };

  const performCreate = <TData extends ITableRowData = ITableRowData>(_rowIndex: number, data: TData): Promise<TData> => {
    const newRows = [...args.valueAccessor()];
    newRows.push(data);

    args.onChange(newRows);

    return Promise.resolve(data);
  };

  const exportToExcel = (_payload: IGetListDataPayload): Promise<void> => {
    return Promise.reject('Export to Excel not implemented');
  };

  const reorder = (payload: RowsReorderPayload): Promise<void> => {
    const newRows = payload.getNew();
    args.onChange(newRows);

    payload.applyOrder(newRows);
    return Promise.resolve();
  };

  const supportsReordering = (_args: SupportsReorderingArgs): boolean => {
    return true;
  };

  const repository: IRepository = {
    repositoryType: 'inMemory-repository',
    fetch,
    reorder,
    exportToExcel,
    prepareColumns,
    performCreate,
    performUpdate,
    performDelete,
    supportsReordering,
  };
  return repository;
};

export const useInMemoryRepository = (args: IWithInMemoryRepositoryArgs): IRepository => useMemo<IRepository>(() => createRepository(args), [args]);

export interface IWithFormFieldRepositoryArgs {
  propertyName: string;
  getFieldValue?: (propertyName: string) => object[];
  onChange?: (...args: unknown[]) => void;
}

export const FormDataSourceTable: FC<IHasFormDataSourceConfig & PropsWithChildren<Omit<IDataTableProviderWithRepositoryProps, 'repository'>>> = (props) => {
  const { propertyName, getFieldValue, onChange, metadata, ...restProps } = props;
  const metadataDispatcher = useMetadataDispatcher();

  const valueAccessor = useCallback(() => getFieldValue(propertyName), [getFieldValue, propertyName]);

  const repository = useInMemoryRepository({ valueAccessor, onChange, metadata, metadataDispatcher });

  return (
    <DataTableProviderWithRepository {...restProps} repository={repository} />
  );
};
