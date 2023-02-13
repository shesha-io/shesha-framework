import { IConfigurableActionConfiguration } from '../../../../interfaces/configurableAction';
import { IConfigurableFormComponent } from '../../../../interfaces/formDesigner';

export interface IDrawerProps extends IConfigurableFormComponent {
  showFooter?: boolean;

  showOkayBtn?: boolean;
  onOkAction?: IConfigurableActionConfiguration;
  okText?: string;
  okButtonCustomEnabled?: string;

  showCancelBtn?: boolean;
  onCancelAction?: IConfigurableActionConfiguration;
  cancelText?: string;
  cancelButtonCustomEnabled?: string;

  placement?: 'top' | 'right' | 'bottom' | 'left';
  height?: string | number;
  width?: string | number;

  components?: IConfigurableFormComponent[];
}
