import { IConfigurableFormComponent } from '@/providers';
import { IFormItem } from '@/interfaces';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';

export interface IRefListStatusProps extends IConfigurableFormComponent, Omit<IFormItem, 'name'> {
  referenceListId: IReferenceListIdentifier;
  showIcon?: boolean;
  solidBackground?: boolean;
  showReflistName?: boolean;
}
