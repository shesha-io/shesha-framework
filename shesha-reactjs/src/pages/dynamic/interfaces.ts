import { FormFullName } from '../../providers/form/models';

export type FormMode = 'designer' | 'edit' | 'readonly';

interface IDialogClosable {
  onCloseDialog?: () => void;
}

export interface IDynamicPageProps extends IDialogClosable {
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

  /**
   * How you want the navigation to occur
   *  - `stacked` means uses shallow routing with dialog that fills the entire screen
   *  - `stackedInline` means uses shallow routing with dialog that only fills the content area (Currently not supported)
   */
  navMode?: 'stacked' | 'stackedInline';
}

export interface EntityAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: unknown;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: IEntity;
}

export interface IEntity {
  id: string;
  [name: string]: unknown;
}

export interface INavigationState extends IDialogClosable, Omit<IDynamicPageState, 'navigationState'> {
  closing?: boolean;
}

export interface IDynamicPageState extends IDynamicPageProps {
  stackId?: string;
}
