import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

export interface IDataSourceArguments {
  dataSourceUrl?: any;
  queryParams?: any;
  actionConfiguration?: IConfigurableActionConfiguration;
  filter?: string;
  entityType?: string | IEntityTypeIdentifier;
  labelProperty?: string;
  tooltipProperty?: string;
  maxResultCount?: number;
  buttonType?: string;
}
