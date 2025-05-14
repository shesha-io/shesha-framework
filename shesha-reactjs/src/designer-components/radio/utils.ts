import { RadioChangeEvent, SpaceProps } from 'antd';
import { nanoid } from '@/utils/uuid';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { CSSProperties } from 'react';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';

export interface IRadioProps {
  items?: ILabelValue[];
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
  value?: any;
  onChange?: (e: RadioChangeEvent) => void;
  onBlur?: (e: any) => void;
  onFocus?: (e: any) => void;
  style?: CSSProperties;
  dataSourceUrl?: string;
  reducerFunc?: string; // The function that receives data from the API and returns it in the format { value, label }
  readOnly?: boolean;
  defaultValue?: any;
}

export const getDataSourceList = (
  dataSource: DataSourceType,
  values: ILabelValue[],
  refList: ReferenceListItemDto[],
  urlList: ILabelValue<any>[] = []
): ILabelValue[] => {
  switch (dataSource) {
    case 'values':
      return values;

    case 'referenceList':
      return (refList || [])?.map(({ id, item, itemValue }) => ({ id, value: itemValue, label: item }));
    case 'url':
      return urlList?.map((props) => (props?.id ? props : { ...props, id: nanoid() }));
  }
};
