import { nanoid } from '@/utils/uuid';
import { useMemo } from 'react';
import { ITableColumnsBuilder, TableColumnsFluentSyntax } from '@/providers/dataTable/interfaces';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';

const getColumnsBuilder = (): ITableColumnsBuilder => {
  const builder: ITableColumnsBuilder = {
    columns: [],
    addProperty: function (name: string, caption: string): ITableColumnsBuilder {
      this.columns.push({
        id: nanoid(),
        sortOrder: this.columns.length,
        itemType: 'item',
        isVisible: true,
        columnType: 'data',

        propertyName: name,
        caption,
        allowSorting: true,
      });
      return this;
    },
  };

  return builder;
};

export const useDataTableFluentColumns = (columns: TableColumnsFluentSyntax): IConfigurableColumnsProps[] => {
  const configurableColumns = useMemo(() => {
    const builder = getColumnsBuilder();
    columns(builder);
    return builder.columns;
  }, [columns]);

  return configurableColumns;
};
