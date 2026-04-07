import { Form } from 'antd';
import React, { FC, PropsWithChildren, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { RowDataInitializer } from '@/components/reactTable/interfaces';
import { FormProvider, ShaForm, useForm } from '@/providers/index';
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
import { addDelayedUpdateProperty, useDelayedUpdateOrUndefined } from '../delayedUpdateProvider/index';
import ParentProvider from '../parentProvider/index';
import { filterDataByOutputComponents } from '../form/api';
import { useFormDesignerComponents } from '../form/hooks';
import { removeGhostKeys } from '@/utils/form';
import { ShaFormProvider } from '../form/providers/shaFormProvider';
import { useShaForm } from '../form/store/shaFormInstance';
import { makeErrorWithMessage } from '@/utils/errors';
import { isDefined } from '@/utils/nullables';

export type DataProcessor = <TData extends object = object>(data: TData) => Promise<TData>;

export interface ICrudProviderProps {
  id?: string | undefined;
  isNewObject: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  mode?: CrudMode | undefined;
  allowChangeMode: boolean;
  data: object | RowDataInitializer;
  updater?: DataProcessor | undefined;
  creater?: DataProcessor | undefined;
  deleter?: () => Promise<void> | undefined;
  onSave?: DataProcessor | undefined;
  autoSave?: boolean;
  formFlatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  itemListId?: string | undefined;
}

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
  } = props;

  const [state, dispatch] = useReducer(reducer, {
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

  const { form, setFormData, setFormMode } = useForm();

  const { getPayload: getDelayedUpdate } = useDelayedUpdateOrUndefined() ?? {};
  const toolboxComponents = useFormDesignerComponents();

  const switchModeInternal = useCallback((mode: CrudMode, allowChangeMode: boolean): void => {
    if (mode === 'read')
      setFormMode('readonly');
    if (mode === 'update' || mode === 'create')
      setFormMode('edit');
    dispatch(switchModeAction({ mode, allowChangeMode }));
  }, [dispatch, setFormMode]);

  const switchMode = useCallback((mode: CrudMode): void => {
    if (state.allowChangeMode)
      switchModeInternal(mode, state.allowChangeMode);
  }, [state.allowChangeMode, switchModeInternal]);

  useEffect(() => {
    dispatch(setAutoSaveAction(autoSave));
  }, [autoSave, dispatch]);

  useEffect(() => {
    const modeToUse = allowChangeMode ? state.mode : mode;

    if (state.allowChangeMode !== allowChangeMode || state.mode !== modeToUse)
      switchModeInternal(modeToUse, allowChangeMode);
  }, [mode, allowChangeMode, state.mode, state.allowChangeMode, switchModeInternal]);

  const setInitialValuesLoading = useCallback((loading: boolean): void => {
    dispatch(setInitialValuesLoadingAction(loading));
  }, [dispatch]);

  const setInitialValues = useCallback((values: object): void => {
    dispatch(setInitialValuesAction(values));
  }, [dispatch]);

  useEffect(() => {
    if (typeof data === 'object') {
      setInitialValues(data);
      setFormData({ values: data, mergeValues: true });
    } else {
      setInitialValuesLoading(true);
      const dataResponse = data();

      Promise.resolve(dataResponse).then((response) => {
        setInitialValues(response);
        setFormData({ values: response, mergeValues: true });
      });
    }
  }, [data, setFormData, setInitialValues, setInitialValuesLoading]);

  //#region Allow Edit/Delete/Create

  useEffect(() => {
    dispatch(setAllowEditAction(allowEdit));
  }, [allowEdit, dispatch]);

  useEffect(() => {
    dispatch(setAllowDeleteAction(allowDelete));
  }, [allowDelete, dispatch]);

  //#endregion

  const resetErrors = (): void => {
    dispatch(resetErrorsAction());
  };

  const performSave = async (processor: DataProcessor, updateType: string): Promise<void> => {
    if (!isDefined(form))
      throw new Error('performSave must be used within a ShaFormProvider');

    dispatch(saveStartedAction());

    try {
      const values = await form.validateFields();

      // TODO: call common data preparation code (check configurableFormRenderer)
      const mergedData = { ...state.initialValues, ...values };

      const postData = removeGhostKeys(
        filterDataByOutputComponents(
          mergedData,
          props.formFlatMarkup.allComponents,
          toolboxComponents,
        ),
      );
        // send data of stored files
      const delayedUpdate = typeof getDelayedUpdate === 'function' ? getDelayedUpdate() : undefined;
      if (delayedUpdate)
        addDelayedUpdateProperty(postData, delayedUpdate);

      const finalData = onSave
        ? await onSave(postData)
        : postData;
      await processor(finalData);

      dispatch(saveSuccessAction());
    } catch (error) {
      dispatch(saveFailedAction(makeErrorWithMessage(error, `${updateType} failed`)));
      throw error;
    }
  };

  const performUpdate = (): Promise<void> => {
    if (!updater) return Promise.reject('CrudProvider: `updater` property is not specified');

    return performSave(updater, 'Update');
  };

  const debouncedUpdate = useDebouncedCallback(
    () => {
      performUpdate();
    },
    // delay in ms
    300,
  );

  const performCreate = (): Promise<void> => {
    if (!creater) return Promise.reject('CrudProvider: `creater` property is not specified');

    return performSave(creater, 'Create');
  };

  const performDelete = async (): Promise<void> => {
    if (!deleter) throw 'CrudProvider: `deleter` property is not specified';

    dispatch(deleteStartedAction());

    try {
      await deleter();
      dispatch(deleteSuccessAction());
    } catch (error) {
      dispatch(deleteFailedAction(makeErrorWithMessage(error, 'Failed to delete row')));
      throw error;
    }
  };

  const reset = async (): Promise<void> => {
    if (!form) throw new Error('reset must be used within a ShaFormProvider');
    await form.resetFields();
    resetErrors();
  };

  const getFormData = (): object => {
    if (!form) throw new Error('reset must be used within a ShaFormProvider');
    return form.getFieldsValue();
  };
  const getInitialData = (): object | undefined => {
    return state.initialValues;
  };

  const autoSaveEnqueued = useRef<boolean>(false);

  const handleFocusIn = useCallback((): void => {
    if (autoSaveEnqueued.current === true) {
      autoSaveEnqueued.current = false;
      // auto save
      debouncedUpdate();
    }
  }, [debouncedUpdate]);

  const onValuesChangeInternal = (_changedValues: object, values: object): void => {
    // recalculate components visibility
    setFormData({ values, mergeValues: true });

    if (!state.autoSave || state.mode !== 'update') return;

    if (!form) throw new Error("form is not defined");
    if (!form.isFieldsTouched()) return;

    autoSaveEnqueued.current = true;
  };

  useEffect(() => {
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [handleFocusIn]);


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
        component={false}
        {... (form ? { form } : {})}
        onValuesChange={onValuesChangeInternal}
        {...props.formSettings}
        initialValues={state.initialValues ? state.initialValues as Record<string, unknown> : {}}
      >
        <ParentProvider
          name={`CrudProvider-${id}`}
          model={{ componentName: 'ListItem', editMode: parentMode, readOnly: state.mode === "read" }}
          isScope
        >
          {children}
        </ParentProvider>
      </Form>
    </CrudContext.Provider>
  );
};

const DataListCrudProvider: FC<PropsWithChildren<ICrudProviderProps>> = (props) => {
  const {
    children,
    mode = 'read',
    formSettings,
    formFlatMarkup,
  } = props;
  const [form] = Form.useForm();

  const [shaForm] = useShaForm({
    antdForm: form,
    form: undefined,
    init: (form) => {
      form.initByMarkup({
        formFlatMarkup: formFlatMarkup,
        formSettings: formSettings,
      });
    },
  });

  return (
    <ShaFormProvider shaForm={shaForm}>
      <ShaForm.MarkupProvider markup={formFlatMarkup}>
        <FormProvider
          form={form}
          name=""
          formSettings={formSettings}
          mode={mode === 'read' ? 'readonly' : 'edit'}
          isActionsOwner={false}
          shaForm={shaForm} // TODO: review
        >
          <CrudProvider {...props}>
            {children}
          </CrudProvider>
        </FormProvider>
      </ShaForm.MarkupProvider>
    </ShaFormProvider>
  );
};

function useDataListCrud(require: boolean = true): ICrudContext | undefined {
  const context = useContext(CrudContext);

  if (context === undefined && require) {
    throw new Error('useDataListCrud must be used within a DataListCrudProvider');
  }

  return context;
}

export { DataListCrudProvider, useDataListCrud };
