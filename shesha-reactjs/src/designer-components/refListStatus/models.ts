import { IReferenceListIdentifier } from 'providers/referenceListDispatcher/models';
import { IFormItem } from '../..';
import { IConfigurableFormComponent } from '../../providers';

export interface IRefListStatusProps extends IConfigurableFormComponent, IFormItem {
  referenceListId: IReferenceListIdentifier;
  showIcon?: boolean;
  solidBackground?: boolean;
  showReflistName?: boolean;
}
