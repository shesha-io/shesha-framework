import { ITablePagerProps } from '@/components';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IPagerComponentProps extends Omit<ITablePagerProps, 'style'>, IConfigurableFormComponent {}

export type PagerComponentDefinition = ComponentDefinition<"datatable.pager", IPagerComponentProps>;
