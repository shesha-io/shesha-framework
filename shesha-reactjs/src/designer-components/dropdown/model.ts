import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { IDropdownProps } from '@/components/dropdown/model';

export type DataSourceType = 'values' | 'referenceList' | 'url';

export interface ILabelValue<TValue = any> {
  id: string;
  label: string;
  value: TValue;
}

export interface IDropdownComponentProps extends Omit<IDropdownProps, 'style'>, IConfigurableFormComponent, IInputStyles {
}
