import React, { FC, useContext, useEffect } from 'react';
import useThunkReducer from '../../hooks/thunkReducer';
import { CRUD_CONTEXT_INITIAL_STATE, CrudContext, ICrudContext } from './contexts';
import reducer from './reducer';
import { setAllowDeleteAction, setIsReadonlyAction as setAllowEditAction, setLastErrorAction, switchModeAction } from './actions';
import { CrudMode } from './models';
import { Form, message } from 'antd';
import { FormProvider } from 'providers/form';
import { IErrorInfo } from 'interfaces/errorInfo';

export interface ICrudProviderProps {
    isNewObject: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
    mode?: CrudMode;
    data: any;
    updater?: (data: any) => Promise<any>;
    creater?: (data: any) => Promise<any>;
    deleter?: () => Promise<any>;
}

const CrudProvider: FC<ICrudProviderProps> = ({ children, data, updater, creater, deleter, isNewObject, mode = 'read', allowEdit, allowDelete }) => {
    const [state, dispatch] = useThunkReducer(reducer, {
        ...CRUD_CONTEXT_INITIAL_STATE,
        isNewObject,
        allowEdit,
        allowDelete,
        mode
    });
    const [form] = Form.useForm();

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

    const switchMode = (mode: CrudMode) => {
        dispatch(switchModeAction(mode));
    };

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

        const values = await form.validateFields();

        // todo: call common data preparation code (check configurableFormRenderer)

        const mergedData = { ...data, ...values };

        try {
            await updater(mergedData);
            setLastError(null);
        } catch (error) {
            setLastError(getErrorInfo(error, 'Update failed'));
            throw error;
        }
    };

    const performCreate = async () => {
        if (!creater)
            throw 'CrudProvider: `creater` property is not specified';

        const values = await form.validateFields();

        // todo: call common data preparation code (check configurableFormRenderer)

        const mergedData = { ...data, ...values };

        try {
            await creater(mergedData);
            setLastError(null);
        } catch (error) {
            console.log('LOG: error', error);
            setLastError(getErrorInfo(error, 'Create failed'));
            throw error;
        }
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
        return data;
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
                    initialValues={data}
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