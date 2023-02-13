import { IConfigurableFormComponent } from '../../../../../providers/form/models';
import { ITableViewProps } from '../../../../../providers/tableViewSelectorConfigurator/models';
import { MutableRefObject } from 'react';

export interface ITableViewSelectorProps extends IConfigurableFormComponent {
  filters: ITableViewProps[];
  useExpression?: boolean;
  persistSelectedFilters?: boolean;
  componentRef: MutableRefObject<any>;
}
