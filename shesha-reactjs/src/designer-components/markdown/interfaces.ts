import { IConfigurableFormComponent } from '@/interfaces';
export interface IMarkdownProps extends IConfigurableFormComponent {
  content: string;
  textColor?: string;
  remarkPlugins?: string[];
  style: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  hideBorder: boolean;
  borderSize: number;
  borderRadius: number;
  borderColor: string;
}

export interface IMarkdownComponentProps {
  style: React.CSSProperties;
  content: string;
  textColor?: string;
  remarkPlugins?: string[];
}
