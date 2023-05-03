import { IConfigurableFormComponent } from '../../../providers/form/models';
import { ITableViewProps } from '../../../providers/tableViewSelectorConfigurator/models';

export interface ITableViewSelectorComponentProps extends IConfigurableFormComponent {
  filters: ITableViewProps[];
  persistSelectedFilters?: boolean;
}
