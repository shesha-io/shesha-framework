import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent } from '@/interfaces/formDesigner';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';
import { IBorderValue } from '../_settings/utils/border/interfaces';
import { IShadowValue } from '../_settings/utils/shadow/interfaces';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { IInputStyles } from '@/index';

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
  headerStyle?: string;
  footerStyle?: string;
  shadow?: IShadowValue;
  headerShadow?: IShadowValue;
  headerBackground?: IBackgroundValue;
  font?: IFontValue;
  footerShadow?: IShadowValue;
  footerBackground?: IBackgroundValue;
  desktop?: IInputStyles;
  tablet?: IInputStyles;
  mobile?: IInputStyles;



  components?: IConfigurableFormComponent[];
}
