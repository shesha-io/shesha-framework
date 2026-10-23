import { FormFullName } from '@/providers/form/models';

type FormMode = 'designer' | 'edit' | 'readonly';

export interface IDynamicPageProps {
  /**
   * Form name.
   */
  formId: FormFullName;

  /**
   * Entity id. This should not be confused with the form id
   */
  id?: string;

  /**
   * form mode.
   */
  mode?: FormMode;

  path?: string | string[];
}
