export type TimePickerChangeEvent = (value: number | null, timeString: string) => void;
export type RangePickerChangeEvent = (values: number[] | null, timeString: [string, string]) => void;

export interface ITimePickerProps {
    className?: string;
    defaultValue?: string | [string, string];
    format?: string;
    value?: string | [string, string];
    placeholder?: string;
    popupClassName?: string;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    disabled?: boolean; // Use
    range?: boolean; // Use
    allowClear?: boolean;
    autoFocus?: boolean;
    inputReadOnly?: boolean;
    showNow?: boolean;
    hideDisabledOptions?: boolean;
    use12Hours?: boolean;
    hideBorder?: boolean;
    onChange?: TimePickerChangeEvent | RangePickerChangeEvent;
    style?: React.CSSProperties;
    readOnly?: boolean;
  }