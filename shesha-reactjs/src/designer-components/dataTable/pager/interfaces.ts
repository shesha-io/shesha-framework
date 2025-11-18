import { ITablePagerProps } from '@/components';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IPagerComponentProps extends Omit<ITablePagerProps, 'style'>, IConfigurableFormComponent {}

export type PagerComponentDefinition = IToolboxComponent<IPagerComponentProps>;
