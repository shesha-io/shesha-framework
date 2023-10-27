import { IConfigurableFormComponent } from "../../../../providers";
import { ITableViewProps } from "../../../../providers/tableViewSelectorConfigurator/models";

export interface IDataSourceComponentProps extends IConfigurableFormComponent {
    sourceType?: 'Form' | 'Entity' |'Url';
    entityType?: string;
    endpoint?: string;

    filters?: ITableViewProps [];
    //persistSelectedFilters?: boolean;
    //componentRef?: MutableRefObject<any>;

    maxResultCount?: number;
}
  