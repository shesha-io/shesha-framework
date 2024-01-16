import { Form } from 'antd';
import React, { FC, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { RowDataInitializer } from '@/components/reactTable/interfaces';
import useThunkReducer from '@/hooks/thunkReducer';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { FormProvider, useForm } from '@/providers/index';
import { IFlatComponentsStructure, IFormSettings } from '@/providers/form/models';
import {
  deleteFailedAction,
  deleteStartedAction,
  deleteSuccessAction,
  resetErrorsAction,
  saveFailedAction,
  saveStartedAction,
  saveSuccessAction,
  setAllowDeleteAction,
  setAllowEditAction,
  setAutoSaveAction,
  setInitialValuesAction,
  setInitialValuesLoadingAction,
  switchModeAction,
} from '../crudContext/actions';
import { CRUD_CONTEXT_INITIAL_STATE, CrudContext, ICrudContext } from '../crudContext/contexts';
import { CrudMode } from '../crudContext/models';
import reducer from '../crudContext/reducer';
import { useDelayedUpdate } from '../delayedUpdateProvider/index';
import ParentProvider from '../parentProvider/index';

export type DataProcessor = (data: any) => Promise<any>;

export interface ICrudProviderProps {
  id?: string;
  isNewObject: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  mode?: CrudMode;
  allowChangeMode: boolean;
  data: object | RowDataInitializer;
  updater?: DataProcessor;
  creater?: DataProcessor;
  deleter?: () => Promise<any>;
  onSave?: DataProcessor;
  autoSave?: boolean;
  flatComponents?: IFlatComponentsStructure;
  formSettings?: IFormSettings;
  itemListId?: string;
}

const DataListCrudProvider: FC<PropsWithChildren<ICrudProviderProps>> = (props) => {
  const {
    children,
    mode = 'read',
    formSettings,
  } = props;
  const [form] = Form.useForm();


  return (
      <FormProvider
        form={form}
        name={''}
        allComponents={props.flatComponents.allComponents}
        componentRelations={props.flatComponents.componentRelations}
        formSettings={formSettings}
        mode={mode === 'read' ? 'readonly' : 'edit'}
        isActionsOwner={false}
      >
        <CrudProvider {...props}>
          {children}
        </CrudProvider>
      </FormProvider>
  );
};

const CrudProvider: FC<PropsWithChildren<ICrudProviderProps>> = (props) => {
  const {
    id,
    children,
    data,
    updater,
    creater,
    deleter,
    isNewObject,
    mode = 'read',
    allowEdit,
    allowDelete,
    onSave,
    allowChangeMode,
    autoSave = false,
    itemListId
  } = props;

  const [state, dispatch] = useThunkReducer(reducer, {
    ...CRUD_CONTEXT_INITIAL_STATE,
    id,
    isNewObject,
    allowEdit,
    allowDelete,
    mode,
    allowChangeMode,
    autoSave,
    initialValues: typeof data !== 'function' ? data : undefined,
  });

  const {form, setFormData, setFormMode} = useForm();

  const {getPayload: getDelayedUpdate} = useDelayedUpdate(false) ?? {};

  const switchModeInternal = (mode: CrudMode, allowChangeMode: boolean) => {
    if (mode === 'read')
      setFormMode('readonly');
    if (mode === 'update' || mode === 'create')
      setFormMode('edit');
    dispatch(switchModeAction({ mode, allowChangeMode }));
  };

  const switchMode = (mode: CrudMode) => {
    if (state.allowChangeMode) switchModeInternal(mode, state.allowChangeMode);
  };

  useEffect(() => {
    if (autoSave !== state.autoSave) dispatch(setAutoSaveAction(autoSave));
  }, [autoSave]);

  useEffect(() => {
    const modeToUse = allowChangeMode ? state.mode : mode;

    if (state.allowChangeMode !== allowChangeMode || state.mode !== modeToUse)
      switchModeInternal(modeToUse, allowChangeMode);
  }, [mode, allowChangeMode]);

  const setInitialValuesLoading = (loading: boolean) => {
    dispatch(setInitialValuesLoadingAction(loading));
  };

  const setInitialValues = (values: object) => {
    dispatch(setInitialValuesAction(values));
  };

  useEffect(() => {
    if (typeof data === 'function') {
      setInitialValuesLoading(true);
      const dataResponse = data();

      Promise.resolve(dataResponse).then((response) => {
        setInitialValues(response);
        setFormData({values: response, mergeValues: true});
      });
    } else {
      setInitialValues(data);
      setFormData({values: data, mergeValues: true});
    }
  }, [data]);

  //#region Allow Edit/Delete/Create

  const setAllowEdit = (allowEdit: boolean) => {
    dispatch(setAllowEditAction(allowEdit));
  };

  useEffect(() => {
    if (state.allowEdit !== allowEdit) setAllowEdit(allowEdit);
  }, [allowEdit]);

  const setAllowDelete = (allowDelete: boolean) => {
    dispatch(setAllowDeleteAction(allowDelete));
  };

  useEffect(() => {
    if (state.allowDelete !== allowDelete) setAllowDelete(allowDelete);
  }, [allowDelete]);

  //#endregion

  const resetErrors = () => {
    dispatch(resetErrorsAction());
  };

  const getErrorInfo = (error: any, message: string): IErrorInfo => {
    return {
      message: message,
      ...error,
    };
  };

  const performSave = (processor: DataProcessor, updateType: string) => {
    if (!processor) return Promise.reject('`processor` must be defined');

    dispatch(saveStartedAction());

    return form
      .validateFields()
      .then((values) => {
        // todo: call common data preparation code (check configurableFormRenderer)
        const mergedData = { ...state.initialValues, ...values };

        // send data of stored files
        const delayedUpdate = typeof getDelayedUpdate === 'function' ? getDelayedUpdate() : null;
        if (Boolean(delayedUpdate)) mergedData['_delayedUpdate'] = delayedUpdate;

        const finalDataPromise = onSave ? Promise.resolve(onSave(mergedData)) : Promise.resolve(mergedData);

        return finalDataPromise.then((finalData) => {
          return processor(finalData)
            .then(() => {
              dispatch(saveSuccessAction());
            })
            .catch((error) => {
              dispatch(saveFailedAction(getErrorInfo(error, `${updateType} failed`)));
              throw error;
            });
        });
      })
      .catch((validationErrors) => {
        dispatch(saveFailedAction(getErrorInfo(validationErrors, `${updateType} failed`)));
        throw validationErrors;
      });
  };

  const performUpdate = () => {
    if (!updater) return Promise.reject('CrudProvider: `updater` property is not specified');

    return performSave(updater, 'Update');
  };

  const debouncedUpdate = useDebouncedCallback(
    () => {
      performUpdate();
    },
    // delay in ms
    300
  );

  const performCreate = () => {
    if (!creater) return Promise.reject('CrudProvider: `creater` property is not specified');

    return performSave(creater, 'Create');
  };

  const performDelete = async () => {
    if (!deleter) throw 'CrudProvider: `deleter` property is not specified';

    dispatch(deleteStartedAction());

    try {
      await deleter();
      dispatch(deleteSuccessAction());
    } catch (error) {
      dispatch(deleteFailedAction(getErrorInfo(error, 'Failed to delete row')));
      throw error;
    }
  };

  const reset = async () => {
    await form.resetFields();
    resetErrors();
  };

  const getFormData = () => {
    return form.getFieldsValue();
  };
  const getInitialData = () => {
    return state.initialValues;
  };

  const autoSaveEnqueued = useRef<boolean>(false);

  const handleFocusIn = () => {
    if (autoSaveEnqueued.current === true) {
      autoSaveEnqueued.current = false;
      // auto save
      debouncedUpdate();
    }
  };

  const onValuesChangeInternal = (_changedValues: any, values: any) => {
    // recalculate components visibility
    setFormData({ values, mergeValues: true });

    if (!state.autoSave || state.mode !== 'update') return;

    if (!form.isFieldsTouched()) return;

    autoSaveEnqueued.current = true;
  };

  useEffect(() => {
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);


  const contextValue: ICrudContext = {
    ...state,
    switchMode,
    performUpdate,
    performCreate,
    performDelete,
    reset,
    getFormData,
    getInitialData,
  };

  const parentMode = state.mode === "update" ? "editable" : "readOnly";

  return (
    <CrudContext.Provider value={contextValue}>
      <Form 
        key={state.mode}
        component={false} form={form} initialValues={state.initialValues} onValuesChange={onValuesChangeInternal} {...props.formSettings}
      >
        <ParentProvider model={{componentName: 'ListItem', editMode: parentMode, readOnly: state.mode === "read"}} subFormIdPrefix={itemListId}>
          {children}
        </ParentProvider>
      </Form>
    </CrudContext.Provider>
  );
};

function useDataListCrud(require: boolean = true) {
  const context = useContext(CrudContext);

  if (context === undefined && require) {
    throw new Error('useDataListCrud must be used within a DataListCrudProvider');
  }

  return context;
}

export { DataListCrudProvider, useDataListCrud };
