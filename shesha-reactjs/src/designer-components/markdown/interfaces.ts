import { IConfigurableFormComponent } from '@/interfaces';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { IBorderValue } from '../_settings/utils/border/interfaces';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';
import { IShadowValue } from '../_settings/utils/shadow/interfaces';
import { IDimensionsValue } from '../_settings/utils/dimensions/interfaces';

export interface IMarkdownProps extends IConfigurableFormComponent {
  content: string;
  textColor?: string;
  remarkPlugins?: string[];
  font: IFontValue;
  style: string;
  border: IBorderValue;
  background: IBackgroundValue;
  shadow: IShadowValue;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  hideBorder: boolean;
  borderSize: number;
  borderRadius: number;
  borderColor: string;
  dimensions: IDimensionsValue;
}

export interface IMarkdownComponentProps {
  style: React.CSSProperties;
  content: string;
  textColor?: string;
  remarkPlugins?: string[];
}
