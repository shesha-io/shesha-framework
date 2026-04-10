import { GetDataError } from '@/hooks';
import { IConfigurableFormComponent, IFlatComponentsStructure } from '@/interfaces';
import { IFormSettings, IPersistedFormProps } from '../form/models';
import { createNamedContext } from '@/utils/react';

export type IPersistedFormPayload = Pick<IPersistedFormProps, 'id' | 'description' | 'module' | 'name'>;

export interface IFetchDataSuccessPayload {
  entityId: string;
}

export interface IFetchDataErrorPayload {
  error: GetDataError<unknown>;
}

export interface ISubFormStateContext<TValue extends object = object> extends IPersistedFormPayload, IFlatComponentsStructure {
  /** True only if the config was fetched from the server using formId
   * If the markup was passed to the sub form, this will be false
   */
  hasFetchedConfig?: boolean;
  initialValues?: unknown | undefined;
  components?: IConfigurableFormComponent[] | undefined;
  formSettings?: IFormSettings | undefined;
  propertyName?: string | undefined;
  errors?: {
    getData?: GetDataError<unknown> | undefined;
    getForm?: unknown | undefined;
    postData?: GetDataError<unknown> | undefined;
    putData?: GetDataError<unknown> | undefined;
  };
  loading?: {
    getData?: boolean;
    getForm?: boolean;
    postData?: boolean;
    putData?: boolean;
  };
  value?: TValue | undefined;
  context?: string | undefined;
  fetchedEntityId?: string | undefined;
}

export interface ISubFormActionsContext {
  getData?: () => void;
  postData?: () => void;
  putData?: () => void;
  deleteData?: () => void;
  getChildComponents: (id: string) => IConfigurableFormComponent[];
}

export const SUB_FORM_CONTEXT_INITIAL_STATE: ISubFormStateContext = {
  components: [],
  allComponents: {},
  componentRelations: {},
  formSettings: undefined,
  loading: {},
  errors: {},
};

export const SubFormContext = createNamedContext<ISubFormStateContext | undefined>(undefined, "SubFormContext");

export const SubFormActionsContext = createNamedContext<ISubFormActionsContext | undefined>(undefined, "SubFormActionsContext");
