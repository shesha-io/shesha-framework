import { IConfigurableFormComponent } from '../../../../providers/form/models';

export interface ITextAreaComponentProps extends IConfigurableFormComponent {
    placeholder?: string;
    showCount?: boolean;
    autoSize?: boolean;
    allowClear?: boolean;
    hideBorder?: boolean;
    initialValue?: string;
    passEmptyStringByDefault?: boolean;
  }