import { ComponentDefinition } from '@/interfaces';
import { FormMode, IConfigurableFormComponent } from '@/providers/form/models';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

export interface IAlertComponentProps extends IConfigurableFormComponent {
  text: string;
  description?: string | undefined;
  showIcon?: boolean | undefined;
  alertType?: AlertType | undefined;
  closable?: boolean | undefined;
  icon?: string | undefined;
  banner?: boolean | undefined;
  marquee?: boolean | undefined;
}

interface IAlertComponentCalulatedValues {
  evaluatedMessage: string;
  evaluatedDescription: string;
  formMode: FormMode;
}

export type AlertComponentDefinition = ComponentDefinition<"alert", IAlertComponentProps, IAlertComponentCalulatedValues>;
