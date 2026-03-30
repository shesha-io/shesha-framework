import { IStoredFilter } from "@/interfaces";
import { IConfigurableFormComponent } from "@/providers";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

export interface IDataSourceComponentProps extends IConfigurableFormComponent {
  sourceType?: 'Form' | 'Entity' | 'Url';
  entityType?: string | IEntityTypeIdentifier;
  endpoint?: string;

  filters?: IStoredFilter [];
  maxResultCount?: number;
}
