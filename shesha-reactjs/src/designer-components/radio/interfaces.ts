import { RadioChangeEvent, SpaceProps } from 'antd';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { CSSProperties } from 'react';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { ComponentDefinition, IConfigurableFormComponent } from '@/interfaces';

/** The subset of the model that determines which options a radio group displays. */
export interface IRadioOptionsSource {
  items?: ILabelValue[] | undefined;
  referenceListId?: IReferenceListIdentifier | undefined;
  dataSourceType: DataSourceType;
  dataSourceUrl?: string | undefined;
  /** The function that receives data from the API and returns it in the format { value, label } */
  reducerFunc?: string | undefined;
}

export interface IRadioProps extends Partial<IRadioOptionsSource> {
  /**
   * Options to render. When supplied they are used as-is; otherwise they are resolved
   * from the data source described by the remaining properties.
   */
  options?: ILabelValue[] | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string | undefined;
  direction?: SpaceProps['orientation'] | undefined;
  value?: number | string | undefined;
  onChange?: ((e: RadioChangeEvent) => void) | undefined;
  onBlur?: React.FocusEventHandler<HTMLDivElement> | undefined;
  onFocus?: React.FocusEventHandler<HTMLDivElement> | undefined;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement> | undefined;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement> | undefined;
  style?: CSSProperties | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  /** Kept for consumers that have not moved to Interaction Mode yet (e.g. checkbox group). */
  readOnly?: boolean | undefined;
}

export interface IRadioComponentProps extends IRadioOptionsSource, IConfigurableFormComponent {
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string | undefined;
  direction?: SpaceProps['orientation'] | undefined;
}

interface IRadioComponentCalculatedValues {
  dataSourceUrl?: string | undefined;
}

export type RadioComponentDefinition = ComponentDefinition<"radio", IRadioComponentProps, IRadioComponentCalculatedValues>;
