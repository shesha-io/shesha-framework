import { CodeEditor } from '../codeEditor/codeEditor';
import React, { FC, useState, useCallback } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { Switch, Input, Select } from 'antd';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import { ContextPropertyAutocomplete } from '../contextPropertyAutocomplete';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useForm } from '@/providers';
import TextArea from 'antd/lib/input/TextArea';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import PrefixSuffixComponent from '../stylePrefixSuffix/components/prefixSuffix/prefixSuffixComponent';
import StyleGroup from '../_settings/components/styleGroup';
import FormItem from '../_settings/components/formItem';

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {
    const { Option } = Select;

    const { readOnly } = props;
    const { model, onValuesChange } = useSettingsForm<ITextFieldComponentProps>();

    const [searchQuery, setSearchQuery] = useState('');

    const filterSettingsItem = useCallback((itemName: string) => {
        return itemName.toLowerCase().includes(searchQuery.toLowerCase());
    }, [searchQuery]);

    const renderSettingsItem = (name: string, component: React.ReactNode, noName?: boolean) => {
        if (!filterSettingsItem(name)) return null;
        return noName ? <FormItem key={name} label={name} jsSetting>
            {component}
        </FormItem> : (
            <SettingsFormItem key={name} name={name} label={name} jsSetting>
                {component}
            </SettingsFormItem>
        );
    };

    const tabs = [
        {
            key: "display",
            tab: "Display",
            content: (
                <>
                    <Input
                        placeholder="Search settings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    {renderSettingsItem("label", <Input readOnly={readOnly || model.hideLabel} />)}
                    {renderSettingsItem("textType",
                        <Select>
                            <Option value="text">Text</Option>
                            <Option value="password">Password</Option>
                        </Select>
                    )}
                    {renderSettingsItem("placeholder", <Input readOnly={readOnly} />)}
                    {renderSettingsItem("description", <TextArea readOnly={readOnly} />)}
                    {renderSettingsItem("passEmptyStringByDefault", <Switch disabled={readOnly} />)}
                    {renderSettingsItem("initialValue", <Input readOnly={readOnly} />)}
                    {renderSettingsItem("hidden", <Switch disabled={readOnly} />)}
                    {renderSettingsItem("editMode", <ReadOnlyModeSelector readOnly={readOnly} />)}
                </>
            )
        },
        {
            key: "events",
            tab: "Events",
            content: (
                <>
                    {renderSettingsItem("onChange", <CodeEditor readOnly={readOnly} />)}
                    {renderSettingsItem("onBlur", <CodeEditor readOnly={readOnly} />)}
                    {renderSettingsItem("onFocus", <CodeEditor readOnly={readOnly} />)}
                </>
            )
        },
        {
            key: "validation",
            tab: "Validation",
            content: (
                <>
                    {renderSettingsItem("validate.required", <Switch disabled={readOnly} />, true)}
                    {renderSettingsItem("validate.minLength", <Input type="number" readOnly={readOnly} />)}
                    {renderSettingsItem("validate.maxLength", <Input type="number" readOnly={readOnly} />)}
                    {renderSettingsItem("validate.pattern", <Input readOnly={readOnly} />)}
                    {renderSettingsItem("validationMessage", <Input readOnly={readOnly} />)}
                </>
            )
        },
        {
            key: "style",
            tab: "Style",
            content: (
                <StyleGroup
                    readOnly={readOnly}
                    onValuesChange={onValuesChange}
                    model={model}
                />
            )
        },
        {
            key: "security",
            tab: "Security",
            content: (
                <SettingsFormItem
                    jsSetting
                    label="Permissions"
                    name="permissions"
                    initialValue={model.permissions}
                    tooltip="Enter a list of permissions that should be associated with this component"
                >
                    <PermissionAutocomplete readOnly={readOnly} />
                </SettingsFormItem>
            )
        }
    ];

    return (
        <SettingsTabs tabs={tabs} />
    );
};

export const TextFieldSettingsForm: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) =>
    SettingsForm<any>({ ...props, children: <TextFieldSettings {...props} /> });