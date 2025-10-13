import { IConfigurableFormComponent } from '@/providers/form/models';
import { ITableViewProps } from '@/providers/dataTable/filters/models';

export interface ITableViewSelectorComponentProps extends IConfigurableFormComponent {
  filters: ITableViewProps[];
  persistSelectedFilters?: boolean;
  showIcon?: boolean;
}
