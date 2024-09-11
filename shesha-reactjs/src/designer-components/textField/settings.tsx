import React, { FC } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { Switch, Input, Select } from 'antd';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import StyleGroup from '../_settings/components/styleGroup';
import SearchableTabs from '../_settings/components/tabs/searchableTabsComponent';
import { SettingInput } from '../_settings/components/utils';
import LabelConfiguratorComponent from '../styleLabel/components/label/labelConfigurator';

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {

    const { readOnly } = props;
    const { model } = useSettingsForm<ITextFieldComponentProps>();

    const renderSettingsItem = (name: string, label: string, component: React.ReactNode) => {
        return (
            <SettingsFormItem key={name} name={name} label={label} jsSetting>
                {component}
            </SettingsFormItem>
        )
    };

    const tabs = [
        {
            key: "display",
            label: "Display",
            children: (
                <>

                    <LabelConfiguratorComponent model={model} {...props} />
                    <SettingInput label="Text Type" value={model.textType} property='textType' readOnly={readOnly} type='dropdown' dropdownOptions={['text', 'password'].map(value => ({ label: value, value }))} />
                    <SettingInput label="Placeholder" value={model.placeholder} property='placeholder' readOnly={readOnly} />
                    <SettingInput label="Description" value={model.description} property='description' readOnly={readOnly} type='textarea' />
                    <SettingInput label="passEmptyStringByDefault" value={model.passEmptyStringByDefault} property='passEmptyStringByDefault' readOnly={readOnly} type='switch' />
                    <SettingInput label="Initial Value" value={model.initialValue} property='initialValue' readOnly={readOnly} hidden={model.passEmptyStringByDefault} />
                    <SettingInput label="Hidden" value={model.hidden} property='hidden' readOnly={readOnly} type='switch' />
                    <ReadOnlyModeSelector readOnly={readOnly} />
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
                    <SettingInput label="Validation Message" value={model.validate.message} property='validation.message' readOnly={readOnly} />
                </>

        },
        {
            key: "style",
            label: "Style",
            children: <StyleGroup model={model} omitted={['shadow', 'stylingBox', 'style']} {...props} />

        },
        {
            key: "security",
            label: "Security",
            children: (
                <>
                    {renderSettingsItem("permissions", "Permissions", <PermissionAutocomplete readOnly={readOnly} />)}
                </>
            )
        }
    ];

    return (
        <SearchableTabs model={{ tabs: tabs }} />
    );
};

export const TextFieldSettingsForm: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) =>
    SettingsForm<any>({ ...props, children: <TextFieldSettings {...props} /> });