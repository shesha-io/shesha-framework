import { IConfigurableFormComponent } from '../../../../../providers/form/models';
import { ITableViewProps } from '../../../../../providers/tableViewSelectorConfigurator/models';
import { MutableRefObject } from 'react';

export type FilterTarget = 'model' | 'table';

export interface ICustomFilterProps extends IConfigurableFormComponent {
  filters: ITableViewProps[];
  useExpression?: boolean;
  componentRef: MutableRefObject<any>;
  target?: FilterTarget;
}
