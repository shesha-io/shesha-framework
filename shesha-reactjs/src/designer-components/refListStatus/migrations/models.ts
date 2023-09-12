import { IFormItem } from '../../../interfaces';
import { IConfigurableFormComponent } from '../../../providers';

export interface IRefListStatusPropsV0 extends IConfigurableFormComponent, IFormItem {
  module: string;
  nameSpace: string;
  showIcon?: boolean;
  solidBackground?: boolean;
  showReflistName?: boolean;
}
