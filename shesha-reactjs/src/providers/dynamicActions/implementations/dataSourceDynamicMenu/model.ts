import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

type QueryParam = {
  param: string;
  value: string;
};

export interface IDataSourceArguments {
  dataSourceUrl?: string | undefined;
  queryParams?: QueryParam[] | undefined;
  actionConfiguration?: IConfigurableActionConfiguration;
  filter?: string | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  labelProperty?: string | undefined;
  tooltipProperty?: string | undefined;
  maxResultCount?: number | undefined;
  buttonType?: string | undefined;
}
