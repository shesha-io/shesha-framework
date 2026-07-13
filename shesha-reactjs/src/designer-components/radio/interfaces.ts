import { RadioChangeEvent, SpaceProps } from 'antd';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { CSSProperties } from 'react';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { ComponentDefinition, IConfigurableFormComponent } from '@/interfaces';

export interface IRadioProps {
  items?: ILabelValue[] | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string | undefined;
  referenceListId?: IReferenceListIdentifier | undefined;
  dataSourceType: DataSourceType;
  direction?: SpaceProps['orientation'] | undefined;
  value?: number | string | undefined;
  onChange?: ((e: RadioChangeEvent) => void) | undefined;
  onBlur?: React.FocusEventHandler<HTMLDivElement> | undefined;
  onFocus?: React.FocusEventHandler<HTMLDivElement> | undefined;
  style?: CSSProperties | undefined;
  dataSourceUrl?: string | undefined;
  reducerFunc?: string | undefined; // The function that receives data from the API and returns it in the format { value, label }
  readOnly?: boolean | undefined;
  enableStyleOnReadonly?: boolean | undefined;
}

export interface IRadioComponentProps extends Omit<IRadioProps, 'style' | "readOnly">, IConfigurableFormComponent { }

interface IRadioComponentCalculatedValues {
  dataSourceUrl?: string | undefined;
}

export type RadioComponentDefinition = ComponentDefinition<"radio", IRadioComponentProps, IRadioComponentCalculatedValues>;
