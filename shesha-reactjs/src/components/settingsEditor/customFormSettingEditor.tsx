import ConfigurableForm from '@/components/configurableForm';
import { ConfigurableFormInstance } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { FC } from 'react';
import { Form } from 'antd';
import { ISettingEditorWithValueProps } from './models';
import { ISettingIdentifier } from './provider/models';
import { useSettingsEditor } from './provider';
import React, {
    useEffect,
    useMemo,
    useRef,
} from 'react';

export const CustomFormSettingEditor: FC<ISettingEditorWithValueProps> = (props) => {
    const { selection, value } = props;
    const { setting: configuration } = selection;
    const { editorForm } = configuration;

    const [form] = Form.useForm();
    const formRef = useRef<ConfigurableFormInstance>();

    const { setEditor, saveSettingValue, editorMode } = useSettingsEditor();

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