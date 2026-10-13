import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { GroupingItem, ISortingItem } from "@/providers/dataTable/interfaces";

export interface IWorkflowInstanceStartActionsProps { }

export interface IDataSourceArguments {
    dataSourceUrl?: any;
    queryParams?: any;
    actionConfiguration?: IConfigurableActionConfiguration;
    filter?: string;
    entityTypeShortAlias?: string;
    labelProperty?: string;
    tooltipProperty?: string;
    maxResultCount?: number;
    buttonType?: string;
    grouping?: GroupingItem[];
    sorting?: ISortingItem[];
}
