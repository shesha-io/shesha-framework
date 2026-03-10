import { RadioChangeEvent, SpaceProps } from 'antd';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { CSSProperties } from 'react';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { ComponentDefinition, IConfigurableFormComponent } from '@/interfaces';
import { IEventHandlers } from '@/components/formDesigner/components/utils';

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
  enableStyleOnReadonly?: boolean;
}

export interface IEnhancedRadioProps extends Omit<IRadioProps, 'style'>, IConfigurableFormComponent { }

interface IRadioComopnentCalulatedValues {
  eventHandlers: IEventHandlers;
  dataSourceUrl?: string;
  defaultValue?: any;
}

export type RadioComponentDefinition = ComponentDefinition<"radio", IEnhancedRadioProps, IRadioComopnentCalulatedValues>;
