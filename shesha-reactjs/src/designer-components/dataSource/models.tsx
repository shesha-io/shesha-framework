import { IStoredFilter } from "@/interfaces";
import { IConfigurableFormComponent } from "@/providers";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

export interface IDataSourceComponentProps extends IConfigurableFormComponent {
  sourceType?: 'Form' | 'Entity' | 'Url' | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  endpoint?: string | undefined;

  filters?: IStoredFilter [] | undefined;
  maxResultCount?: number | undefined;
  /* @deprecated */
  name?: string | undefined;
}
