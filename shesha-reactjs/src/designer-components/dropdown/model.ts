import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { IDropdownProps } from '@/components/dropdown/model';
import { CustomLabeledValue } from '@/components/refListDropDown/models';
import { ComponentDefinition } from '@/interfaces';

export type DataSourceType = 'values' | 'referenceList' | 'url';

export interface ILabelValue<TValue = any> {
  id: string;
  label: string;
  value: TValue;
}

export interface IDropdownComponentProps extends Omit<IDropdownProps, 'style'>, IConfigurableFormComponent, IInputStyles {
}

interface ITextFieldComponentCalulatedValues {
  eventHandlers?: { onChange: (value: CustomLabeledValue<any>, option: any) => any };
  defaultValue?: any;
}

export type DropdownComponentDefinition = ComponentDefinition<"dropdown", IDropdownComponentProps, ITextFieldComponentCalulatedValues>;
