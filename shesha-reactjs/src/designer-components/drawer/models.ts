import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent } from '@/interfaces/formDesigner';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';
import { IInputStyles, IStyleType } from '@/providers/form/models';

export interface IDrawerProps extends IConfigurableFormComponent {
  showFooter?: boolean | undefined;
  showHeader?: boolean | undefined;

  showOkayBtn?: boolean | undefined;
  onOkAction?: IConfigurableActionConfiguration | undefined;
  okText?: string | undefined;
  okButtonCustomEnabled?: string | undefined;

  showCancelBtn?: boolean | undefined;
  onCancelAction?: IConfigurableActionConfiguration | undefined;
  cancelText?: string | undefined;
  cancelButtonCustomEnabled?: string | undefined;

  placement?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  height?: string | number | undefined;
  width?: string | number | undefined;
  hideBorder?: boolean | undefined;
  stylingBox?: string | undefined;
  borderSize?: number | undefined;
  borderRadius?: number | undefined;
  borderColor?: string | undefined;
  fontColor?: string | undefined;
  backgroundColor?: string | undefined;
  fontSize?: number | undefined;
  headerStyles?: IStyleType | undefined;
  footerStyles?: IStyleType | undefined;
  background?: IBackgroundValue | undefined;

  desktop?: IInputStyles | undefined;
  tablet?: IInputStyles | undefined;
  mobile?: IInputStyles | undefined;
  components?: IConfigurableFormComponent[] | undefined;
}
