import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent } from '@/interfaces/formDesigner';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';
import { IBorderValue } from '../_settings/utils/border/interfaces';

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
  background?: IBackgroundValue;
  border?: IBorderValue;
  hideBorder?: boolean;
  stylingBox?: string;
  borderSize?: number;
  borderRadius?: number;
  borderColor?: string;
  fontColor?: string;
  backgroundColor?: string;
  fontSize?: number;


  components?: IConfigurableFormComponent[];
}
