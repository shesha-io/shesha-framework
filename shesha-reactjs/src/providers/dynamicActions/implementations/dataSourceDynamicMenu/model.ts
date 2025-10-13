import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";

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
}
