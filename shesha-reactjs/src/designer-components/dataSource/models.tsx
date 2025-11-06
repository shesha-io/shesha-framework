import { IConfigurableFormComponent } from "@/providers";
import { ITableViewProps } from "@/providers/dataTable/filters/models";
import { IEntityTypeIndentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

export interface IDataSourceComponentProps extends IConfigurableFormComponent {
  sourceType?: 'Form' | 'Entity' | 'Url';
  entityType?: string | IEntityTypeIndentifier;
  endpoint?: string;

  filters?: ITableViewProps [];
  maxResultCount?: number;
}
