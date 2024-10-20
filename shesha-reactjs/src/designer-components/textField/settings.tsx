import React, { FC } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import StyleGroupComponent from '../_settings/components/styleGroup/styleGroup';
import SearchableTabsComponent from '../_settings/components/tabs/searchableTabsComponent';
import LabelConfiguratorComponent from '../styleLabel/labelConfigurator';
import FormItem from '../_settings/components/formItem';
import PrefixSuffixComponent from '../stylePrefixSuffix/prefixSuffixComponent';
import { ContextPropertyAutocomplete } from '../contextPropertyAutocomplete';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useForm } from '@/providers';
import { SettingInput } from '../_settings/components/settingsInput';

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
                        id="415cc8ec-2fd1-4c5a-88e2-965153e16069"
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
                        value={model.textType}
                        propertyName='textType'
                        readOnly={readOnly}
                        inputType='dropdown'
                        jsSetting={true}
                        dropdownOptions={['text', 'password'].map(value => ({ label: value, value }))}
                    />
                    <SettingInput label="Placeholder" value={model.placeholder} propertyName='placeholder' readOnly={readOnly} jsSetting={true} />
                    <SettingInput label="Description" value={model.description} propertyName='description' readOnly={readOnly} inputType='textArea' jsSetting={true} />
                    <PrefixSuffixComponent readOnly={readOnly} />
                    <SettingInput label="Initial Value" value={model.initialValue} propertyName='initialValue' readOnly={readOnly} jsSetting={true} />
                    <SettingInput label="Hidden" value={model.hidden} propertyName='hidden' readOnly={readOnly} inputType='switch' jsSetting={true} layout='horizontal' />
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
                    <SettingInput label="On Change" value={model.onChangeCustom} propertyName='onChangeCustom' readOnly={readOnly} inputType='codeEditor' description="Enter custom eventhandler on changing of event. (form, event) are exposed"
                        jsSetting={true} />
                    <SettingInput label="On Blur" value={model.onBlurCustom} propertyName='onBlurCustom' readOnly={readOnly} inputType='codeEditor' description="Enter custom eventhandler on blur of event. (form, event) are exposed"
                        jsSetting={true} />
                    <SettingInput label="On Focus" value={model.onFocusCustom} propertyName='onFocusCustom' readOnly={readOnly} inputType='codeEditor' description="Enter custom eventhandler on focus of event. (form, event) are exposed"
                        jsSetting={true} />
                </>
            )
        },
        {
            key: "validation",
            label: "Validation",
            children:
                <>
                    <SettingInput label="Required" value={model.validate?.required} propertyName='validate.required' readOnly={readOnly} inputType='switch' layout='horizontal'
                        jsSetting={true} />
                    <SettingInput label="Min Length" value={model.validate?.minLength} propertyName='validate.minLength' readOnly={readOnly} inputType='number'
                        jsSetting={true} />
                    <SettingInput label="Max Length" value={model.validate?.maxLength} propertyName='validate.maxLength' readOnly={readOnly} inputType='number'
                        jsSetting={true} />
                    <SettingInput label="Validator" value={model.validate?.validator} propertyName='validate.validator' readOnly={readOnly} inputType='codeEditor' description="Enter custom validator logic for form.item rules. Returns a Promise"
                        jsSetting={true} />
                    <SettingInput label="Validation Message" value={model.validate?.message} propertyName='validate.message' readOnly={readOnly}
                        jsSetting={true} />
                </>
        },
        {
            key: "style",
            label: "Style",
            children: <FormItem name='styles' label='' jsSetting={false}>
                <StyleGroupComponent omitted={['shadow', 'stylingBox', 'style']} readOnly={readOnly} />
            </FormItem>
        },
        {
            key: "security",
            label: "Security",
            children: (
                <SettingInput label='Permissions' value={model.permissions} propertyName='permissions' readOnly={readOnly}>
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