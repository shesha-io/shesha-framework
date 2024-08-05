import ConfigurableForm from '@/components/configurableForm';
import React, { useEffect, useMemo } from 'react';
import { DataTypes } from '@/interfaces/dataTypes';
import { DesignerToolbarSettings, FormMarkup } from '@/interfaces';
import { FC } from 'react';
import { Form } from 'antd';
import { ISettingIdentifier } from './provider/models';
import { useSettingsEditor } from './provider';
import { ISettingEditorWithValueProps } from './models';

export const GenericSettingEditor: FC<ISettingEditorWithValueProps> = (props) => {
    const { selection, value } = props;
    const { setting: configuration } = selection;
    const [form] = Form.useForm();

    const { setEditor, saveSettingValue, editorMode } = useSettingsEditor();
        
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
    
    useEffect(() => {
        setEditor({ save: startSave });
    }, [selection]);

    const model = useMemo(() => {
        return { value: value };
    }, [value]);

    const formMarkup: FormMarkup = useMemo(() => {
        const builder = new DesignerToolbarSettings({});
        if (configuration.description) {
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
            key={JSON.stringify(formMarkup)}
            mode={editorMode}
            form={form}
            markup={formMarkup}
            initialValues={model}
        />
    );
};
