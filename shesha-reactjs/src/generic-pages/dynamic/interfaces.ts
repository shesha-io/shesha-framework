import { IEntity } from '@/interfaces/gql';
import { FormFullName } from '@/providers/form/models';

export type FormMode = 'designer' | 'edit' | 'readonly';

export interface IDynamicPageProps {
  /**
   * Form name.
   */
  formId?: FormFullName;

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

export interface EntityAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: unknown;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: IEntity;
}

export interface IDynamicPageState extends IDynamicPageProps {
  stackId?: string;
}
