import { CodeEditor } from '../codeEditor/codeEditor';
import React, { FC } from 'react';
import SectionSeparator from '@/components/sectionSeparator';
import SettingsForm from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';
import { Checkbox, Input, InputNumber, Select } from 'antd';
import { EXPOSED_VARIABLES } from './exposedVariables';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import ColumnsList from './columnsList';
import { IKeyInformationBarProps } from './interfaces';

const KeyInformationBarSettings: FC<ISettingsFormFactoryArgs<IKeyInformationBarProps>> = (props) => {
    const { readOnly } = props;
    const { Option } = Select;

    return (
        <>
            <SettingsFormItem name="componentName" label="Component Name" required>
                <Input readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="barHeight" label="Bar Height" jsSetting>
                <InputNumber readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="barWidth" label="Bar Width" jsSetting>
                <InputNumber readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
                <Checkbox disabled={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="hideLabel" label="Hide Label" valuePropName="checked" jsSetting>
                <Checkbox disabled={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="vertical" label="Vertical" valuePropName="checked" jsSetting>
                <Checkbox disabled={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="columns" label="Columns">
                <ColumnsList readOnly={readOnly} />
            </SettingsFormItem>
            <SettingsFormItem name="alignItems" label="Align Items">
                <Select >
                    <Option value="flex-start">Flex Start</Option>
                    <Option value="flex-end">Flex End</Option>
                    <Option value="center">Center</Option>
                </Select>
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
        </>
    );
};

export const KeyInformationBarSettingsForm: FC<ISettingsFormFactoryArgs<IKeyInformationBarProps>> = (props) =>
    SettingsForm<any>({ ...props, children: <KeyInformationBarSettings {...props} /> });