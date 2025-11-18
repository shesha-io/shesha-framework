import { IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { IDimensionsValue } from '@/designer-components/_settings/utils/dimensions/interfaces';

export interface IQuickSearchComponentProps extends IConfigurableFormComponent {
  block?: boolean;
  dimensions?: IDimensionsValue;
}

export type QuickSearchComponentDefinition = IToolboxComponent<IQuickSearchComponentProps>;
