import { IConfigurableColumnsProps, isDataColumn } from "@/providers/datatableColumnsConfigurator/models";
import React, { ComponentType, useCallback, useMemo, FC } from "react";

import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse } from "../interfaces";
import { IHasModelType, IHasRepository, IRepository, RowsReorderPayload, SupportsReorderingArgs } from "./interfaces";
import { IHasFormDataSourceConfig, useMetadataDispatcher } from "@/providers";
import { wrapDisplayName } from "@/utils/react";
import { IModelMetadata, isJsonEntityMetadata, isObjectMetadata } from "@/interfaces/metadata";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";

export interface IWithInMemoryRepositoryArgs {
  valueAccessor: () => object[];
  onChange: (value: object[]) => void;
  metadata?: IModelMetadata;
  metadataDispatcher: IMetadataDispatcher;
}

type FilterRowsArgs = Pick<IGetListDataPayload, 'quickSearch' | 'columns'> & {
  rows: object[];
};
const filterRows = ({ rows, columns, quickSearch }: FilterRowsArgs): object[] => {
  if (!quickSearch)
    return rows;
  const lowerQuickSearch = quickSearch.toLowerCase();

  return rows.filter((row) => {
    if (!row)
      return false;

    return columns.some((col) => {
      if (!col.propertyName)
        return false;

      const value = row[col.propertyName];
      return value && typeof (value) === 'string' && value.toLowerCase().includes(lowerQuickSearch);
    });
  });
};


type ApplyPagingArgs = Pick<IGetListDataPayload, 'currentPage' | 'pageSize'> & Pick<ITableDataInternalResponse, 'totalRowsBeforeFilter'>;
const applyPaging = (rows: object[], { pageSize, currentPage, totalRowsBeforeFilter }: ApplyPagingArgs): ITableDataInternalResponse => {
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

    const allRows = args.valueAccessor() ?? [];

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
            convertedDataCol.dataFormat = propertyMeta.dataFormat;
            convertedDataCol.metadata = propertyMeta;
            convertedDataCol.referenceListModule = propertyMeta.referenceListModule;
            convertedDataCol.referenceListName = propertyMeta.referenceListName;
          }
        }

        converted.push(convertedDataCol);
      }
    }

    return converted;
  };

  const performUpdate = (rowIndex: number, data: any): Promise<any> => {
    const newRows = [...args.valueAccessor() ?? []];
    newRows[rowIndex] = data;
    args.onChange(newRows);

    return Promise.resolve(data);
  };

  const performDelete = (rowIndex: number, data: any): Promise<any> => {
    const newRows = [...args.valueAccessor() ?? []];
    newRows.splice(rowIndex, 1);
    args.onChange(newRows);

    return Promise.resolve(data);
  };

  const performCreate = (_rowIndex: number, data: any): Promise<any> => {
    const newRows = [...args.valueAccessor() ?? []];
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

export const useInMemoryRepository = (args: IWithInMemoryRepositoryArgs): IRepository => useMemo<IRepository>(() => createRepository(args), []);

export function withInMemoryRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository & IHasModelType>, args: IWithInMemoryRepositoryArgs): FC<WrappedProps> {
  const { valueAccessor, onChange } = args;

  return wrapDisplayName((props) => {
    const metadataDispatcher = useMetadataDispatcher();
    const repository = useInMemoryRepository({ valueAccessor, onChange, metadataDispatcher });

    return (<WrappedComponent {...props} repository={repository} modelType={null} />);
  }, "withInMemoryRepository");
};


export interface IWithFormFieldRepositoryArgs {
  propertyName: string;
  getFieldValue?: (propertyName: string) => object[];
  onChange?: (...args: any[]) => void;
}
export function withFormFieldRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository & IHasModelType>): FC<WrappedProps> {
  return wrapDisplayName((props) => {
    const { propertyName, getFieldValue, onChange, metadata } = props as IHasFormDataSourceConfig;
    const metadataDispatcher = useMetadataDispatcher();

    const valueAccessor = useCallback(() => getFieldValue(propertyName), [propertyName]);
    const onChangeAccessor = useCallback((newValue: object[]) => {
      if (onChange)
        onChange(newValue);
    }, [propertyName]);

    const repository = useInMemoryRepository({ valueAccessor, onChange: onChangeAccessor, metadata, metadataDispatcher });

    return (<WrappedComponent {...props} repository={repository} modelType={null} />);
  }, "withFormFieldRepository");
};
