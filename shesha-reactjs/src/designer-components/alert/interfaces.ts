import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IAlertComponentProps extends IConfigurableFormComponent {
  text: string;
  description?: string;
  showIcon?: boolean;
  alertType?: 'success' | 'info' | 'warning' | 'error';
  closable?: boolean;
  icon?: string;
  banner?: boolean;
  marquee?: boolean;
}
