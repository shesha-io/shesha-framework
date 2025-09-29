import { IConfigurableFormComponent } from "@/providers";
import { ITableViewProps } from "@/providers/dataTable/filters/models";

export interface IDataSourceComponentProps extends IConfigurableFormComponent {
  sourceType?: 'Form' | 'Entity' | 'Url';
  entityType?: string;
  endpoint?: string;

  filters?: ITableViewProps [];
  maxResultCount?: number;
}
