import { FormIdentifier, IConfigurableFormComponent } from "../..";
import { ISelectionProps } from "../../providers/dataTableSelection/models";

export type FormSelectionMode = 'name' | 'view' | 'expression';
export type Orientation = 'vertical' | 'horizontal';
export type ListItemWidth = number | 'custom';

export interface IDataListProps {

    dataSource?: string;

    formSelectionMode?: FormSelectionMode;
    formId?: FormIdentifier;
    formType?: string;
    selectionMode?: 'none' | 'single' | 'multiple';
    formIdExpression?: string;
    
    records?: object[];

    selectedRow?: ISelectionProps;
    selectedRows?: { [key in string]: string }[];
    onSelectRow?: (index: number, row: any) => void;
    onMultiSelectRows?: (rows: any[]) => void;
    onSelectedIdsChanged?: (selectedRowIds: string[]) => void;
    onDblClick?: (data: any, index?: number) => void;

    /** Called when fetch data or refresh is complete is complete */
    onFetchDataSuccess?: () => void;
    onRowsChanged?: (rows: object[]) => void;

    isFetchingTableData?: boolean;

    entityType?: string;
    selectedIds?: string[];
    changeSelectedIds?: (selectedIds: string[]) => void;

    orientation?: Orientation;
    listItemWidth?: ListItemWidth;
    customListItemWidth?: number;
}

export interface IDataListComponentProps extends IDataListProps, IConfigurableFormComponent {
}
