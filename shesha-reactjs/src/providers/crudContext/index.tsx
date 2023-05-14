import React, { FC, useContext, useEffect } from 'react';
import useThunkReducer from '../../hooks/thunkReducer';
import { CRUD_CONTEXT_INITIAL_STATE, CrudContext, ICrudContext } from './contexts';
import reducer from './reducer';
import { setAllowDeleteAction, setIsReadonlyAction as setAllowEditAction, setLastErrorAction, setInitialValuesLoadingAction, switchModeAction, setInitialValuesAction } from './actions';
import { CrudMode } from './models';
import { Form, message } from 'antd';
import { FormProvider } from 'providers/form';
import { IErrorInfo } from 'interfaces/errorInfo';
import { RowDataInitializer } from 'components/reactTable/interfaces';

export interface ICrudProviderProps {
    isNewObject: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
    mode?: CrudMode;
    allowChangeMode: boolean;
    data: object | RowDataInitializer;
    updater?: (data: any) => Promise<any>;
    creater?: (data: any) => Promise<any>;
    deleter?: () => Promise<any>;
    onSave?: (data: any) => Promise<any>;
}

const CrudProvider: FC<ICrudProviderProps> = (props) => {
    const { 
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
    } = props;
    const [state, dispatch] = useThunkReducer(reducer, {
        ...CRUD_CONTEXT_INITIAL_STATE,
        isNewObject,
        allowEdit,
        allowDelete,
        mode,
        allowChangeMode,
        initialValues: typeof(data) !== 'function' ? data : undefined,
    });

    //console.log('LOG: CRUD render', { initialValues: state.initialValues });

    const switchModeInternal = (mode: CrudMode, allowChangeMode: boolean) => {
        dispatch(switchModeAction({ mode, allowChangeMode }));
    };

    const switchMode = (mode: CrudMode) => {
        if (state.allowChangeMode)
            switchModeInternal(mode, state.allowChangeMode);
    };

    useEffect(() => {
        const modeToUse = allowChangeMode
            ? state.mode
            : mode;
        
        if (state.allowChangeMode !== allowChangeMode || state.mode !== modeToUse)
            switchModeInternal(modeToUse, allowChangeMode);
    }, [mode, allowChangeMode]);
    
    const [form] = Form.useForm();

    const setInitialValuesLoading = (loading: boolean) => {
        dispatch(setInitialValuesLoadingAction(loading));
    };
    
    const setInitialValues = (values: object) => {
        dispatch(setInitialValuesAction(values));
    };

    useEffect(() => {
        if (typeof(data) === 'function'){
            setInitialValuesLoading(true);
            const dataResponse = data();
            //console.log('LOG: CRUD init called', dataResponse);

            Promise.resolve(dataResponse).then(response => {
                //console.log('LOG: CRUD init resolved', response);
                setInitialValues(response);
                form.setFieldsValue(response);
            });
        } else {
            //console.log('LOG: data changed', data);
            setInitialValues(data);
            form.setFieldsValue(data);
        }
    }, [data]);

    //#region Allow Edit/Delete/Create

    const setAllowEdit = (allowEdit: boolean) => {
        dispatch(setAllowEditAction(allowEdit));
    };

    useEffect(() => {
        if (state.allowEdit !== allowEdit)
            setAllowEdit(allowEdit);
    }, [allowEdit]);

    const setAllowDelete = (allowDelete: boolean) => {
        dispatch(setAllowDeleteAction(allowDelete));
    };

    useEffect(() => {
        if (state.allowDelete !== allowDelete)
            setAllowDelete(allowDelete);
    }, [allowDelete]);

    //#endregion

    const setLastError = (error?: IErrorInfo) => {
        // skip unneeded update when new error and current error is empty
        if (!Boolean(error) && !Boolean(state.lastError))
            return;

        dispatch(setLastErrorAction(error));
    };

    const getErrorInfo = (error: any, message: string): IErrorInfo => {
        return {
            message: message,
            ...error,
        };
    };

    const performUpdate = async () => {
        if (!updater)
            throw 'CrudProvider: `updater` property is not specified';

        const updateInternal = async (finalData: any) => {
            try {
                await updater(finalData);
                setLastError(null);
            } catch (error) {
                setLastError(getErrorInfo(error, 'Update failed'));
                throw error;
            }
        };

        const values = await form.validateFields();

        // todo: call common data preparation code (check configurableFormRenderer)
        const mergedData = { ...state.initialValues, ...values };

        const finalData = onSave
                ? await onSave(mergedData)
                : mergedData;
        
        updateInternal(finalData);
    };

    const performCreate = async () => {
        if (!creater)
            throw 'CrudProvider: `creater` property is not specified';

        const createInternal = async (finalData: any) => {
            try {
                await creater(finalData);
                setLastError(null);
            } catch (error) {
                console.log('LOG: error', error);
                setLastError(getErrorInfo(error, 'Create failed'));
                throw error;
            }
        };
        
        const values = await form.validateFields();

        // todo: call common data preparation code (check configurableFormRenderer)
        const mergedData = { ...state.initialValues, ...values };

        const finalData = onSave
                ? await onSave(mergedData)
                : mergedData;
        
        createInternal(finalData);
    };

    const performDelete = async () => {
        if (!deleter)
            throw 'CrudProvider: `deleter` property is not specified';

        try {
            await deleter();
        } catch (_error) {
            message.error('Failed to delete row');
        }
    };

    const reset = async () => {
        await form.resetFields();
        setLastError(null);
    };

    const getFormData = () => {
        return form.getFieldsValue();
    };
    const getInitialData = () => {
        return state.initialValues;
    };
    

    const contextValue: ICrudContext = {
        ...state,
        switchMode,
        performUpdate,
        performCreate,
        performDelete,
        reset,
        setLastError,
        getFormData,
        getInitialData,
    };

    return (
        <CrudContext.Provider value={contextValue}>
            <FormProvider
                form={form}
                name={''}
                flatComponents={undefined}
                formSettings={undefined}
                mode={'designer'}
                // NOTE: components are visible just because we use designer mode. 
                // implement custom FormProvider or a new mode that will work for tables
                //mode={ state.mode === 'read' ? 'readonly' : 'edit' }
                isActionsOwner={false}
            >
                <Form
                    component={false}
                    form={form}
                    initialValues={state.initialValues}
                >
                    {children}
                </Form>
            </FormProvider>
        </CrudContext.Provider>
    );
};

function useCrud(require: boolean = true) {
    const context = useContext(CrudContext);

    if (context === undefined && require) {
        throw new Error('useCrud must be used within a CrudProvider');
    }

    return context;
}

export { CrudProvider, useCrud };