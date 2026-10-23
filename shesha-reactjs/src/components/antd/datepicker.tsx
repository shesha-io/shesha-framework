import { DatePicker } from 'antd';
import type { Moment } from 'moment';
import momentGenerateConfig from '@rc-component/picker/generate/moment';
import { ComponentProps } from 'react';

const MomentDatePicker = DatePicker.generatePicker<Moment>(momentGenerateConfig);

type DatePickerFocusEventHandler = Required<ComponentProps<typeof MomentDatePicker>>["onFocus"];

export { MomentDatePicker as DatePicker, type DatePickerFocusEventHandler };
