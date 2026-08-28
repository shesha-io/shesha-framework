import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IHtmlComponentProps extends IConfigurableFormComponent {
  contentType?: 'html' | 'jsx' | undefined;
  sanitize?: boolean | undefined;
  html?: string | undefined;
  renderer?: string | undefined;
}
