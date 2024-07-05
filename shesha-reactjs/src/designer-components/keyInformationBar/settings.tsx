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
import { ColorPicker, Show } from '@/components';
import { strings } from '@/components/keyInformationBar/utils';

const KeyInformationBarSettings: FC<ISettingsFormFactoryArgs<IKeyInformationBarProps>> = (props) => {
    const { readOnly } = props;
    const { Option } = Select;
    const { values } = useSettingsForm<IKeyInformationBarProps>();

    const tooltip = strings.tooltip;

    return (
        <>
            <SettingsFormItem name="componentName" label="Component Name" required>
                <Input readOnly={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
                <Checkbox disabled={readOnly} />
            </SettingsFormItem>

            <SettingsFormItem name="orientation" label="Orientation">
                <Select >
                    <Option value="horizontal">Horizontal</Option>
                    <Option value="vertical">Vertical</Option>
                </Select>
            </SettingsFormItem>

            <SettingsFormItem name="columns" label="Columns">
                <ColumnsList readOnly={readOnly} />
            </SettingsFormItem>

            <SectionSeparator title="Divider" />

            <SettingsFormItem name="dividerMargin" label="Divider Margin" jsSetting tooltip={tooltip}>
                <Input readOnly={readOnly} />
            </SettingsFormItem>

            <Show when={values.orientation === "horizontal"}>
                <SettingsFormItem name="dividerHeight" label="Divider Height" jsSetting tooltip={tooltip}>
                    <Input readOnly={readOnly} />
                </SettingsFormItem>
            </Show>

            <Show when={values.orientation === "vertical"}>
                <SettingsFormItem name="dividerWidth" label="Divider Width" jsSetting tooltip={tooltip}>
                    <Input readOnly={readOnly} />
                </SettingsFormItem>
            </Show>
            <SettingsFormItem name="dividerColor" label="Divider Color" jsSetting >
                <ColorPicker readOnly={readOnly} />
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