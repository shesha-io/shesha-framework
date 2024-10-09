import React, { FC } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import StyleGroupComponent from '../_settings/components/styleGroup/styleGroup';
import SearchableTabs from '../_settings/components/tabs/searchableTabsComponent';
import { SettingInput } from '../_settings/components/utils';
import LabelConfiguratorComponent from '../styleLabel/labelConfigurator';
import FormItem from '../_settings/components/formItem';
import PrefixSuffixComponent from '../stylePrefixSuffix/prefixSuffixComponent';
import { ContextPropertyAutocomplete } from '../contextPropertyAutocomplete';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useForm } from '@/providers';

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
                        property='textType'
                        readOnly={readOnly}
                        type='dropdown'
                        jsSetting={true}
                        dropdownOptions={['text', 'password'].map(value => ({ label: value, value }))}
                    />
                    <SettingInput label="Placeholder" value={model.placeholder} property='placeholder' readOnly={readOnly} jsSetting={true} />
                    <SettingInput label="Description" value={model.description} property='description' readOnly={readOnly} type='textarea' jsSetting={true} />
                    <PrefixSuffixComponent readOnly={readOnly} />
                    <SettingInput label="Initial Value" value={model.initialValue} property='initialValue' readOnly={readOnly} jsSetting={true} />
                    <SettingInput label="Hidden" value={model.hidden} property='hidden' readOnly={readOnly} type='switch' jsSetting={true} layout='horizontal'/>
                    <SettingInput label="Edit Mode" property='editMode' readOnly={readOnly} jsSetting={true}>
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
                    <SettingInput label="On Change" value={model.onChangeCustom} property='onChangeCustom' readOnly={readOnly} type='codeEditor' description="Enter custom eventhandler on changing of event. (form, event) are exposed"
                        jsSetting={true} />
                    <SettingInput label="On Blur" value={model.onBlurCustom} property='onBlurCustom' readOnly={readOnly} type='codeEditor' description="Enter custom eventhandler on blur of event. (form, event) are exposed"
                        jsSetting={true} />
                    <SettingInput label="On Focus" value={model.onFocusCustom} property='onFocusCustom' readOnly={readOnly} type='codeEditor' description="Enter custom eventhandler on focus of event. (form, event) are exposed"
                        jsSetting={true} />
                </>
            )
        },
        {
            key: "validation",
            label: "Validation",
            children:
                <>
                    <SettingInput label="Required" value={model.validate?.required} property='validate.required' readOnly={readOnly} type='switch' layout='horizontal'
                        jsSetting={true} />
                    <SettingInput label="Min Length" value={model.validate?.minLength} property='validate.minLength' readOnly={readOnly} type='number'
                        jsSetting={true} />
                    <SettingInput label="Max Length" value={model.validate?.maxLength} property='validate.maxLength' readOnly={readOnly} type='number'
                        jsSetting={true} />
                    <SettingInput label="Validator" value={model.validate?.validator} property='validate.validator' readOnly={readOnly} type='codeEditor' description="Enter custom validator logic for form.item rules. Returns a Promise"
                        jsSetting={true} />
                    <SettingInput label="Validation Message" value={model.validate?.message} property='validate.message' readOnly={readOnly}
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
                <SettingInput label='Permissions' value={model.permissions} property='permissions' readOnly={readOnly}>
                    <PermissionAutocomplete readOnly={readOnly} />
                </SettingInput>
            )
        }
    ];

    return (
        <SearchableTabs
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