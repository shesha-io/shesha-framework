import { IConfigurableFormComponent } from '@/providers/form/models';
import { ITableViewProps } from '@/providers/dataTable/filters/models';
import { ComponentDefinition } from '@/interfaces';

export interface ITableViewSelectorComponentProps extends IConfigurableFormComponent {
  filters: ITableViewProps[];
  persistSelectedFilters?: boolean;
  showIcon?: boolean;
}

export type TableViewSelectorComponentDefinition = ComponentDefinition<"tableViewSelector", ITableViewSelectorComponentProps>;
