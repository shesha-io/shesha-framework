import { IConfigurableFormComponent } from '../../../providers/form/models';
import { ITableViewProps } from '../../../providers/tableViewSelectorConfigurator/models';
import { MutableRefObject } from 'react';

export type FilterTarget = 'model' | 'table';

export interface ICustomFilterComponentProps extends IConfigurableFormComponent {
  filters: ITableViewProps[];
  componentRef: MutableRefObject<any>;
  target?: FilterTarget;
}
