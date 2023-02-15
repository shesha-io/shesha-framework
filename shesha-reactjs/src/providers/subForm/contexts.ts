import { createContext } from 'react';
import { GetDataError } from 'restful-react';
import { IConfigurableFormComponent } from '../../interfaces';
import { IFormSettings } from '../form/models';
import { IPersistedFormProps } from '../formPersisterProvider/models';

export interface IPersistedFormPayload
  extends Pick<IPersistedFormProps, 'id' | 'versionNo' | 'versionStatus' | 'description' | 'module'> { }

export interface IFetchDataErrorPayload {
  error: GetDataError<unknown>;
}

export interface ISubFormStateContext extends IPersistedFormPayload {
  /** True only if the config was fetched from the server using formId
   * If the markup was passed to the sub form, this will be false
   */
  hasFetchedConfig?: boolean;
  initialValues?: any;
  components?: IConfigurableFormComponent[];
  formSettings?: IFormSettings;
  name?: string;
  errors?: {
    getData?: GetDataError<unknown>;
    getForm?: GetDataError<unknown>;
    postData?: GetDataError<unknown>;
    putData?: GetDataError<unknown>;
  };
  loading?: {
    getData?: boolean;
    getForm?: boolean;
    postData?: boolean;
    putData?: boolean;
  };
  value?: any;
}

export interface ISubFormActionsContext {
  getData?: () => void;
  postData?: () => void;
  putData?: () => void;
  deleteData?: () => void;
}

export const SUB_FORM_CONTEXT_INITIAL_STATE: ISubFormStateContext = {
  components: [],
  formSettings: null,
  loading: {},
  errors: {},
};

export const SubFormContext = createContext<ISubFormStateContext>(SUB_FORM_CONTEXT_INITIAL_STATE);

export const SubFormActionsContext = createContext<ISubFormActionsContext>(undefined);
