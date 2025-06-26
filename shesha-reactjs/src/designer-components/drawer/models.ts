import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent } from '@/interfaces/formDesigner';
import { IInputStyles } from '@/index';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';

export interface IDrawerProps extends IConfigurableFormComponent {
  showFooter?: boolean;
  showHeader?: boolean;

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
  hideBorder?: boolean;
  stylingBox?: string;
  borderSize?: number;
  borderRadius?: number;
  borderColor?: string;
  fontColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  headerStyles?: IDrawerProps;
  footerStyles?: any;
  background?: IBackgroundValue;

  desktop?: IInputStyles;
  tablet?: IInputStyles;
  mobile?: IInputStyles;
  components?: IConfigurableFormComponent[];
}
