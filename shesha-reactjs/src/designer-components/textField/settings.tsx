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

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {
    const { Option } = Select;

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
                    {renderSettingsItem("label", "Label", <Input readOnly={readOnly || model.hideLabel} />)}
                    {renderSettingsItem("textType", "Text Type",
                        <Select>
                            <Option value="text">Text</Option>
                            <Option value="password">Password</Option>
                        </Select>
                    )}
                    {renderSettingsItem("placeholder", "Placeholder", <Input readOnly={readOnly} />)}
                    {renderSettingsItem("description", "Description", <TextArea readOnly={readOnly} />)}
                    {renderSettingsItem("passEmptyStringByDefault", "Pass Empty String By Default", <Switch disabled={readOnly} />)}
                    {renderSettingsItem("initialValue", "Initial Value", <Input readOnly={readOnly} />)}
                    {renderSettingsItem("hidden", "Hidden", <Switch disabled={readOnly} />)}
                    {renderSettingsItem("editMode", "Edit Mode", <ReadOnlyModeSelector readOnly={readOnly} />)}
                </>
            )
        },
        {
            key: "events",
            label: "Events",
            children: (
                <>
                    {renderSettingsItem("onChange", "On Change", <CodeEditor mode="dialog" readOnly={readOnly} />)}
                    {renderSettingsItem("onBlur", "On Blur", <CodeEditor mode="dialog" readOnly={readOnly} />)}
                    {renderSettingsItem("onFocus", "On Focus", <CodeEditor mode="dialog" readOnly={readOnly} />)}
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
            children: <StyleGroup model={model} omitted={['shadow', 'stylingBox', 'style']} />

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