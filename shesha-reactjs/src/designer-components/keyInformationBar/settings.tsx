import { CodeEditor } from '../codeEditor/codeEditor';
import React, { FC } from 'react';
import SectionSeparator from '@/components/sectionSeparator';
import SettingsForm from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';
import { Checkbox, Input, InputNumber, Select } from 'antd';
import { EXPOSED_VARIABLES } from './exposedVariables';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import SettingsCollapsiblePanel from '../_settings/settingsCollapsiblePanel';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import { IColumnsComponentProps } from './interfaces';
import ColumnsList from './columnsList';
import { KeyInformationBarProps } from '.';

const KeyInformationBarSettings: FC<ISettingsFormFactoryArgs<KeyInformationBarProps>> = (props) => {
    const { readOnly } = props;

    return (
        <>
            <SettingsFormItem name="componentName" label="Component Name" required>
                <Input readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="barHeight" label="Bar Height" jsSetting>
                <Input readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="barWidth" label="Bar Width" jsSetting>
                <Input readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
                <Checkbox disabled={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="vertical" label="Vertical" valuePropName="checked" jsSetting>
                <Checkbox disabled={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="columns" label="Columns">
                <ColumnsList readOnly={readOnly} />
            </SettingsFormItem>

            <SectionSeparator title="Style" />

            <SettingsFormItem name="style" label="Style">
                <CodeEditor
                    propertyName="style"
                    readOnly={readOnly}
                    mode="dialog"
                    label="Style"
                    description="A script that returns the style of the element as an object. This should conform to CSSProperties"
                    exposedVariables={EXPOSED_VARIABLES}
                />
            </SettingsFormItem>

            <SettingsFormItem name="space" label="Space" jsSetting>
                <InputNumber readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="stylingBox">
                <StyleBox />
            </SettingsFormItem>

            <SettingsCollapsiblePanel header="Security">
                <SettingsFormItem
                    jsSetting
                    label="Permissions"
                    name="permissions"
                    initialValue={props.model.permissions}
                    tooltip="Enter a list of permissions that should be associated with this component"
                >
                    <PermissionAutocomplete readOnly={readOnly} />
                </SettingsFormItem>
            </SettingsCollapsiblePanel>
        </>
    );
};

export const KeyInformationBarSettingsForm: FC<ISettingsFormFactoryArgs<KeyInformationBarProps>> = (props) =>
    SettingsForm<any>({ ...props, children: <KeyInformationBarSettings {...props} /> });