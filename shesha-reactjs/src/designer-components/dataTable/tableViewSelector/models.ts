import { IConfigurableFormComponent } from '@/providers/form/models';
import { ComponentDefinition, IStoredFilter } from '@/interfaces';

export interface ITableViewSelectorComponentProps extends IConfigurableFormComponent {
  filters: IStoredFilter[];
  persistSelectedFilters?: boolean;
  showIcon?: boolean;
}

export type TableViewSelectorComponentDefinition = ComponentDefinition<"tableViewSelector", ITableViewSelectorComponentProps>;
