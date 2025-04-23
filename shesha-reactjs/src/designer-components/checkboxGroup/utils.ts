import { CSSProperties } from 'react';
import { RadioChangeEvent, SpaceProps } from 'antd';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';

type CheckboxGroupMode = 'single' | 'multiple';
export interface ICheckboxGroupProps {
  items?: ILabelValue[];
  mode?: CheckboxGroupMode;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string;
  referenceListId?: IReferenceListIdentifier;
  dataSourceType: DataSourceType;
  direction?: SpaceProps['direction'];
  value?: any[];
  onChange?: (checkedValue: Array<any> | RadioChangeEvent) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  style?: CSSProperties;
  dataSourceUrl?: string;
  reducerFunc?: string;
  readOnly?: boolean;
  defaultValue?: any | any[];
}

export const getSpan = (direction: SpaceProps['direction'], size: number) =>
  direction === 'vertical' ? 24 : size < 4 ? 24 / size : 6;
