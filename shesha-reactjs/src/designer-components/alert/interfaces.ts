import { ComponentDefinition } from '@/interfaces';
import { FormMode, IConfigurableFormComponent } from '@/providers/form/models';

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

interface IAlertComponentCalulatedValues {
  evaluatedMessage: string;
  evaluatedDescription: string;
  formMode: FormMode;
}

export type AlertComponentDefinition = ComponentDefinition<"alert", IAlertComponentProps, IAlertComponentCalulatedValues>;
