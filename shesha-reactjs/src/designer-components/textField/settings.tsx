import { CodeEditor } from '../codeEditor/codeEditor';
import React, { FC, useState, useCallback } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { Switch, Input, Select } from 'antd';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import TextArea from 'antd/lib/input/TextArea';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import StyleGroup from '../_settings/components/styleGroup';
import SearchableTabs from '../_settings/components/tabs/searchableTabsComponent';
import { SettingInput } from '../_settings/components/utils';
import LabelConfigurator from '../styleLabel';
import LabelConfiguratorComponent from '../styleLabel/components/label/labelConfigurator';

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {

    const { readOnly } = props;
    const { model, onValuesChange } = useSettingsForm<ITextFieldComponentProps>();

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
                    {renderSettingsItem("validate.required", "Required", <Switch disabled={readOnly} />)}
                    {renderSettingsItem("validate.minLength", "Min Length", <Input type="number" readOnly={readOnly} />)}
                    {renderSettingsItem("validate.maxLength", "Max Length", <Input type="number" readOnly={readOnly} />)}
                    {renderSettingsItem("validate.pattern", "Pattern", <Input readOnly={readOnly} />)}
                    {renderSettingsItem("validationMessage", "Validation Message", <Input readOnly={readOnly} />)}
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