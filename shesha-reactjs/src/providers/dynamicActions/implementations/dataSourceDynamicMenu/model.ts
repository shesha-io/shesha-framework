import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";

export interface IWorkflowInstanceStartActionsProps { }

export interface IDataSourceArguments {
    dataSourceUrl?: string;
    queryParams?: any;
    actionConfiguration?: IConfigurableActionConfiguration;
    filter?: string;
    entityTypeShortAlias?: string;
    entityLabelProperty?: string;
    entityTooltipProperty?: string;

}
