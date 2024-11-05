import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";

export interface IWorkflowInstanceStartActionsProps { }

export interface IDataSourceArguments {
    dataSourceUrl?: any
    queryParams?: any;
    actionConfiguration?: IConfigurableActionConfiguration;
    filter?: string;
    entityTypeShortAlias?: string;
    entityLabelProperty?: string;
    entitTooltipProperty?: string;
    urlLabelProperty?: string;
    urlTooltipProperty?: string;

}
