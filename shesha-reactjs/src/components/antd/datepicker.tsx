import { DatePicker } from 'antd';
import type { Moment } from 'moment';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';

const MomentDatePicker = DatePicker.generatePicker<Moment>(momentGenerateConfig);

export { MomentDatePicker as DatePicker };
