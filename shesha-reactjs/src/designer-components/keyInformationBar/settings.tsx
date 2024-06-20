import { CodeEditor } from '../codeEditor/codeEditor';
import React, { FC } from 'react';
import SectionSeparator from '@/components/sectionSeparator';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';
import { Checkbox, Input, InputNumber, Select } from 'antd';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import ColumnsList from './columnsList';
import { IKeyInformationBarProps } from './interfaces';
import { Show } from '@/components';

const KeyInformationBarSettings: FC<ISettingsFormFactoryArgs<IKeyInformationBarProps>> = (props) => {
    const { readOnly } = props;
    const { Option } = Select;
    const { values } = useSettingsForm<IKeyInformationBarProps>();

    return (
        <>
            <SettingsFormItem name="componentName" label="Component Name" required>
                <Input readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="dividerMargin" label="Divider Margin" jsSetting>
                <InputNumber readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
                <Checkbox disabled={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="hideLabel" label="Hide Label" valuePropName="checked" jsSetting>
                <Checkbox disabled={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="orientation" label="Orientation">
                <Select >
                    <Option value="horizontal">Horizontal</Option>
                    <Option value="vertical">Vertical</Option>
                </Select>
            </SettingsFormItem>

            <Show when={values.orientation === "horizontal"}>
                <SettingsFormItem name="dividerHeight" label="Divider Height" jsSetting>
                    <InputNumber readOnly={readOnly} />
                </SettingsFormItem>
            </Show>

            <Show when={values.orientation === "vertical"}>
                <SettingsFormItem name="dividerWidth" label="Divider Width" jsSetting >
                    <InputNumber readOnly={readOnly} />
                </SettingsFormItem>
            </Show>



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
                />
            </SettingsFormItem>

            <SettingsFormItem name="gap" label="Gap" jsSetting>
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