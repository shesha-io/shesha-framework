import { nanoid } from 'nanoid/non-secure';
import { CSSProperties } from 'react';
import { RadioChangeEvent, SpaceProps } from 'antd';
import { ReferenceListItemDto } from '../../../../apis/referenceList';
import { IConfigurableFormComponent } from '../../../../interfaces';
import { DataSourceType, ILabelValue } from '../dropdown/models';
import { IReferenceListIdentifier } from '../../../../providers/referenceListDispatcher/models';

export interface IRadioProps extends Omit<IConfigurableFormComponent, 'style'> {
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
  style?: CSSProperties;
  dataSourceUrl?: string;
  reducerFunc?: string; // The function that receives data from the API and returns it in the format { value, label }
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
      return urlList?.map(props => (props?.id ? props : { ...props, id: nanoid() }));
  }
};
