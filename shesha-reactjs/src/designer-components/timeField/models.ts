import React from 'react';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers';
import { PickerFocusEventHandler } from '@rc-component/picker/interface';

export type TimePickerChangeEvent = (value: number | null, timeString: string | null) => void;
export type RangePickerChangeEvent = (values: (number | null)[] | null, timeString: [string, string]) => void;

export type TimeFieldValueType = number | [number, number];

export interface ITimePickerProps {
  // className?: string | undefined;
  format?: string | undefined;
  value?: TimeFieldValueType | null | undefined;
  placeholder?: string | undefined;
  // popupClassName?: string | undefined;
  hourStep?: number | undefined;
  minuteStep?: number | undefined;
  secondStep?: number | undefined;
  disabled?: boolean | undefined;
  range?: boolean | undefined;
  allowClear?: boolean | undefined;
  autoFocus?: boolean | undefined;
  // inputReadOnly?: boolean | undefined;
  showNow?: boolean | undefined;
  hideDisabledOptions?: boolean | undefined;
  use12Hours?: boolean | undefined;
  hideBorder?: boolean | undefined;
  onChange?: TimePickerChangeEvent | RangePickerChangeEvent | undefined;
  style?: React.CSSProperties | undefined;
  readOnly?: boolean | undefined;
  enableStyleOnReadonly?: boolean | undefined;
  onFocus?: PickerFocusEventHandler;
  onBlur?: PickerFocusEventHandler;
}

export interface ITimePickerComponentProps extends Omit<ITimePickerProps, 'defaultValue' | 'style' | "readOnly">, IConfigurableFormComponent {

}

export type TimeFieldComponentDefinition = ComponentDefinition<"timePicker", ITimePickerComponentProps>;
