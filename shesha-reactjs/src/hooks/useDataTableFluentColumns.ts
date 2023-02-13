import { nanoid } from "nanoid";
import { useMemo } from "react";
import { ITableColumnsBuilder, TableColumnsFluentSyntax } from "../providers/dataTable/interfaces";
import { IConfigurableColumnsBase } from "../providers/datatableColumnsConfigurator/models";

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
            });
            return this;
        }
    };

    return builder;
}

export const useDataTableFluentColumns = (columns: TableColumnsFluentSyntax): IConfigurableColumnsBase[] => {
    const configurableColumns = useMemo(() => {
        const builder = getColumnsBuilder();
        columns(builder);
        return builder.columns;
    }, [columns]);

    return configurableColumns;
}