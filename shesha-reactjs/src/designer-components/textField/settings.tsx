import React, { FC } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import LabelConfiguratorComponent from '../styleLabel/labelConfigurator';
import FormItem from '../_settings/components/formItem';
import { ContextPropertyAutocomplete } from '../contextPropertyAutocomplete';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useForm } from '@/providers';
import { SettingInput } from '../settingsInput/settingsInput';
import SearchableTabsComponent from '../propertiesTabs/searchableTabsComponent';

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {
    const readOnly = props.readOnly || false;
    const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
    const { formSettings } = useForm();

    const { model, onValuesChange } = useSettingsForm<ITextFieldComponentProps>();

    const tabs = [
        {
            key: "display",
            label: "Display",
            children: (
                <>
                    <ContextPropertyAutocomplete
                        id="5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4"
                        readOnly={readOnly}
                        defaultModelType={designerModelType ?? formSettings.modelType}
                        formData={model}
                        onValuesChange={onValuesChange}
                    />
                    <FormItem name='hideLabel' label='' jsSetting={false}>
                        <LabelConfiguratorComponent readOnly={readOnly} />
                    </FormItem>
                    <SettingInput
                        label="Text Type"
                        propertyName='textType'
                        readOnly={readOnly}
                        inputType='dropdown'
                        jsSetting={true}
                        dropdownOptions={[
                            { label: 'text', value: 'text' },
                            { label: 'password', value: 'password' }
                        ]}
                    />
                    <SettingInput label="Placeholder" propertyName='placeholder' readOnly={readOnly} jsSetting={true} />
                    <SettingInput label="Description" propertyName='description' readOnly={readOnly} inputType='textArea' jsSetting={true} />
                    <SettingInput label="Initial Value" propertyName='initialValue' readOnly={readOnly} jsSetting={true} />
                    <SettingInput label="Hidden" propertyName='hidden' readOnly={readOnly} inputType='switch' jsSetting={true} layout='horizontal' />
                    <SettingInput label="Edit Mode" propertyName='editMode' readOnly={readOnly} jsSetting={true}>
                        <ReadOnlyModeSelector readOnly={readOnly} value={model.editMode} />
                    </SettingInput>
                </>
            )
        },
        {
            key: "events",
            label: "Events",
            children: (
                <>
                    <SettingInput label="On Change" propertyName='onChangeCustom' readOnly={readOnly} inputType='codeEditor' tooltip="Enter custom eventhandler on changing of event. (form, event) are exposed"
                        jsSetting={true} />
                    <SettingInput label="On Blur" propertyName='onBlurCustom' readOnly={readOnly} inputType='codeEditor' tooltip="Enter custom eventhandler on blur of event. (form, event) are exposed"
                        jsSetting={true} />
                    <SettingInput label="On Focus" propertyName='onFocusCustom' readOnly={readOnly} inputType='codeEditor' tooltip="Enter custom eventhandler on focus of event. (form, event) are exposed"
                        jsSetting={true} />
                </>
            )
        },
        {
            key: "validation",
            label: "Validation",
            children:
                <>
                    <SettingInput label="Required" propertyName='validate.required' readOnly={readOnly} inputType='switch' layout='horizontal'
                        jsSetting={true} />
                    <SettingInput label="Min Length" propertyName='validate.minLength' readOnly={readOnly} inputType='number'
                        jsSetting={true} />
                    <SettingInput label="Max Length" propertyName='validate.maxLength' readOnly={readOnly} inputType='number'
                        jsSetting={true} />
                    <SettingInput label="Validator" propertyName='validate.validator' readOnly={readOnly} inputType='codeEditor' tooltip="Enter custom validator logic for form.item rules. Returns a Promise"
                        jsSetting={true} />
                    <SettingInput label="Validation Message" propertyName='validate.message' readOnly={readOnly}
                        jsSetting={true} />
                </>
        },
        {
            key: "style",
            label: "Style",
            children: <FormItem name='styles' label='' jsSetting={false}>
            </FormItem>
        },
        {
            key: "security",
            label: "Security",
            children: (
                <SettingInput label='Permissions' propertyName='permissions' readOnly={readOnly}>
                    <PermissionAutocomplete readOnly={readOnly} />
                </SettingInput>
            )
        }
    ];

    return (
        <SearchableTabsComponent
            model={{
                tabs: tabs,
                tabType: "card",
                defaultActiveKey: "1",
                hideWhenEmpty: true
            }}
        />
    );
};

export const TextFieldSettingsForm: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) =>
    SettingsForm<any>({ ...props, children: <TextFieldSettings {...props} /> });