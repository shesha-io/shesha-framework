import React, { FC } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { Switch, Input, Select } from 'antd';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import StyleGroupComponent from '../_settings/components/styleGroup/styleGroup';
import SearchableTabs from '../_settings/components/tabs/searchableTabsComponent';
import { SettingInput } from '../_settings/components/utils';
import LabelConfiguratorComponent from '../styleLabel/components/label/labelConfigurator';
import FormItem from '../_settings/components/formItem';

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {

    const readOnly = props.readOnly || false;
    const { model } = useSettingsForm<ITextFieldComponentProps>();

    const tabs = [
        {
            key: "display",
            label: "Display",
            children: (
                <>
                    <LabelConfiguratorComponent model={model} readOnly={readOnly} />
                    <SettingInput label="Text Type" value={model.textType} property='textType' readOnly={readOnly} type='dropdown' dropdownOptions={['text', 'password'].map(value => ({ label: value, value }))} />
                    <SettingInput label="Placeholder" value={model.placeholder} property='placeholder' readOnly={readOnly} />
                    <SettingInput label="Description" value={model.description} property='description' readOnly={readOnly} type='textarea' />
                    <SettingInput label="Initial Value" value={model.initialValue} property='initialValue' readOnly={readOnly} />
                    <SettingInput label="Hidden" value={model.hidden} property='hidden' readOnly={readOnly} type='switch' />
                    <SettingInput label="Edit Mode" property='editMode' readOnly={readOnly}><ReadOnlyModeSelector readOnly={readOnly} value='editable' /></SettingInput>
                </>
            )
        },
        {
            key: "events",
            label: "Events",
            children: (
                <>
                    <SettingInput label="onChange" value={model.onChangeCustom} property='onChange' readOnly={readOnly} type='code' />
                    <SettingInput label="onBlur" value={model.onBlurCustom} property='onBlur' readOnly={readOnly} type='code' />
                    <SettingInput label="onFocus" value={model.onFocusCustom} property='onFocus' readOnly={readOnly} type='code' />
                </>
            )
        },
        {
            key: "validation",
            label: "Validation",
            children:
                <>
                    <SettingInput label="Required" value={model.validate?.required} property='validate.required' readOnly={readOnly} type='switch' />
                    <SettingInput label="Min Length" value={model.validate?.minLength} property='validate.minLength' readOnly={readOnly} type='number' />
                    <SettingInput label="Max Length" value={model.validate?.maxLength} property='validate.maxLength' readOnly={readOnly} type='number' />
                    <SettingInput label="Validator" value={model.validate?.validator} property='validate.validator' readOnly={readOnly} />
                    <SettingInput label="Validation Message" value={model.validate?.message} property='validation.message' readOnly={readOnly} />
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
                <SettingInput label='Permissions' value={model.permissions} property='permissions' readOnly={readOnly}><PermissionAutocomplete readOnly={readOnly} /></SettingInput>
            )
        }
    ];

    return (
        <SearchableTabs model={{ tabs: tabs }} />
    );
};

export const TextFieldSettingsForm: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) =>
    SettingsForm<any>({ ...props, children: <TextFieldSettings {...props} /> });