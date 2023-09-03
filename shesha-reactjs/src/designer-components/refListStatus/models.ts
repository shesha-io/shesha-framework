import { IFormItem } from '../..';
import { IConfigurableFormComponent } from '../../providers';
import { IReferenceListIdentifier } from '../../providers/referenceListDispatcher/models';

export interface IRefListStatusProps extends IConfigurableFormComponent, IFormItem {
  referenceListId: IReferenceListIdentifier;
  showIcon?: boolean;
  solidBackground?: boolean;
  showReflistName?: boolean;
}
