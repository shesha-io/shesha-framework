import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { IReferenceListIdentifier } from '../../../../providers/referenceListDispatcher/models';

export type DataSourceType = 'values' | 'referenceList' | 'url';

export interface ILabelValue<TValue = any> {
  id: string;
  label: string;
  value: TValue;
}

export interface IDropdownProps extends IConfigurableFormComponent {
  dataSourceType: DataSourceType;
  values?: ILabelValue[];
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string;
  referenceListId?: IReferenceListIdentifier;
  value?: any;
  onChange?: any;
  hideBorder?: boolean;
  allowClear?: boolean;
  mode?: 'single' | 'multiple' | 'tags';
  ignoredValues?: number[];
  placeholder?: string;
  useRawValues?: boolean;
}
