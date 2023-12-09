import { Form, Empty } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FC } from 'react';
import { ConfigurableFormInstance, DesignerToolbarSettings, FormMarkup } from '@/components/..';
import { DataTypes } from '@/interfaces/dataTypes';
import ConfigurableForm from '@/components/configurableForm';
import { useSettingsEditor } from './provider';
import { ISettingSelection } from './provider/contexts';
import { ISettingIdentifier, SettingValue } from './provider/models';

export interface ISettingEditorProps {

}

interface ISettingEditorState {
    isLoading: boolean;
    loadingError?: any;
    value?: SettingValue;
}

export const SettingEditor: FC<ISettingEditorProps> = () => {
    const { settingSelection, fetchSettingValue } = useSettingsEditor();
    const [state, setSatate] = useState<ISettingEditorState>({ isLoading: false });

    useEffect(() => {
        if (settingSelection) {
            setSatate(prev => ({ ...prev, isLoading: true, value: null }));
            fetchSettingValue({
                name: settingSelection.setting.name,
                module: settingSelection.setting.module,
                appKey: settingSelection.app?.appKey
            }).then(response => {
                setSatate(prev => ({ ...prev, isLoading: false, value: response }));
            });
        } else
            setSatate(prev => ({ ...prev, isLoading: false, value: null, loadingError: null }));
    }, [settingSelection]);

    return settingSelection
        ? (
            settingSelection.setting.editorForm
                ? <CustomFormSettingEditor selection={settingSelection} value={state.value} />
                : <GenericSettingEditor selection={settingSelection} value={state.value} />
        )
        : (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    'Please select a setting to begin editing'
                }
            />
        );
};

interface ISettingEditorWithValueProps extends ISettingEditorProps {
    selection: ISettingSelection;
    value?: SettingValue;
}

export const GenericSettingEditor: FC<ISettingEditorWithValueProps> = (props) => {
    const { selection, value } = props;
    const { setting: configuration } = selection;
    const [form] = Form.useForm();

    const startSave = () => {
        return form.validateFields().then(values => {
            const settingId: ISettingIdentifier = {
                name: selection.setting.name,
                module: selection.setting.module,
                appKey: selection.app?.appKey,
            };

            return saveSettingValue(settingId, values.value);
        });
    };

    const { setEditor, saveSettingValue, editorMode } = useSettingsEditor();
    useEffect(() => {
        setEditor({ save: startSave });
    }, [selection]);

    const model = useMemo(() => {
        return { value: value };
    }, [value]);

    const formMarkup: FormMarkup = useMemo(() => {
        const builder = new DesignerToolbarSettings({  });
        if (configuration.description){
            builder.addAlert({
                id: 'descriptionAlert',
                propertyName: 'descriptionAlert',
                text: configuration.description,
                alertType: 'info',
            });
        }
        switch (configuration.dataType) {
            case DataTypes.string: {
                builder.addTextField({
                    id: 'value',
                    propertyName: 'value',
                    label: configuration.label,
                    //description: configuration.description
                });
                break;
            }
            case DataTypes.number: {
                builder.addNumberField({
                    id: 'value',
                    propertyName: 'value',
                    label: configuration.label,
                    //description: configuration.description
                });
                break;
            }
            case DataTypes.boolean: {
                builder.addCheckbox({
                    id: 'value',
                    propertyName: 'value',
                    label: configuration.label,
                    //description: configuration.description
                });
                break;
            }
        }
        return builder.toJson();
    }, [configuration]);

    return (
        <ConfigurableForm
            mode={editorMode}
            form={form}
            markup={formMarkup}
            initialValues={model}
        />
    );
};

export const CustomFormSettingEditor: FC<ISettingEditorWithValueProps> = (props) => {
    const { selection, value } = props;
    const { setting: configuration } = selection;
    const { editorForm } = configuration;

    const [form] = Form.useForm();
    const formRef = useRef<ConfigurableFormInstance>();

    const startSave = () => {
        return form.validateFields().then(values => {
            const settingId: ISettingIdentifier = {
                name: selection.setting.name,
                module: selection.setting.module,
                appKey: selection.app?.appKey,
            };
            const data = selection.setting.dataType === DataTypes.object
                ? { ...values ?? {} }
                : values?.value; // extract scalar value
            delete data._formFields;

            return saveSettingValue(settingId, data);
        });
    };

    const { setEditor, saveSettingValue, editorMode } = useSettingsEditor();
    useEffect(() => {
        setEditor({ save: startSave });
    }, [selection]);

    const initialValues = useMemo(() => {
        const result = selection.setting.dataType === DataTypes.object
            ? value
            : { value }; // for scalar types add `value` property
        return result;
    }, [value]);
    
    return (
        <ConfigurableForm
            mode={editorMode}
            form={form}
            initialValues={initialValues}
            formId={editorForm}
            formRef={formRef}
        />
    );
};

export default SettingEditor;