import { DatePicker } from 'antd';
import type { Moment } from 'moment';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';
import type generatePicker from 'antd/es/date-picker/generatePicker';

const MomentDatePicker: ReturnType<typeof generatePicker<Moment>> = DatePicker.generatePicker<Moment>(momentGenerateConfig);

export { MomentDatePicker as DatePicker };