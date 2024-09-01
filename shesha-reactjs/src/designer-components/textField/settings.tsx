import { CodeEditor } from '../codeEditor/codeEditor';
import React, { Children, FC } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';
import { Switch, Input, Select, Collapse, ConfigProvider } from 'antd';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import { ContextPropertyAutocomplete } from '../contextPropertyAutocomplete';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useForm } from '@/providers';
import TextArea from 'antd/lib/input/TextArea';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import SizeComponent from '../styleDimensions/components/size/sizeComponent';
import BorderComponent from '../styleBorder/components/border/borderComponent';
import BackgroundConfigurator from '../styleBackground/components/background/background';
import FontComponent from '../styleFont/components/font/fontComponent';
import PrefixSuffixComponent from '../stylePrefixSuffix/components/prefixSuffix/prefixSuffixComponent';
import { SettingsTabs } from '@/components/formDesigner/componentPropertiesPanel/settingsTabs/settingsTabs';
import ShadowComponent from '../styleShadow/components/shadow/shadowComponent';

const { Panel } = Collapse;
const { Option } = Select;

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {
    const { readOnly } = props;
    const { model, onValuesChange } = useSettingsForm<ITextFieldComponentProps>();
    const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
    const { formSettings } = useForm();

    const stylePanels = (omitted) => [
        {
            key: '1',
            label: 'Font',
            children: <FontComponent readOnly={readOnly} onChange={onValuesChange} value={model.font} />
        },
        {
            key: '2',
            label: 'Size',
            children: <SizeComponent readOnly={readOnly} onChange={onValuesChange} value={model.dimensions} noOverflow />
        },
        {
            key: '3',
            label: 'Border',
            children: <BorderComponent readOnly={readOnly} onChange={onValuesChange} value={model.border} model={model} />
        },
        {
            key: '4',
            label: 'Background',
            children: <BackgroundConfigurator readOnly={readOnly} onValuesChange={onValuesChange} value={model.background} model={model} />
        },
        {
            key: '5',
            label: 'Shadow',
            children: <ShadowComponent readOnly={readOnly} value={model.shadow} />
        },
        {
            key: '6',
            label: 'Styling',
            children: (
                <>
                    <SettingsFormItem name="style" label="Style">
                        <CodeEditor
                            propertyName="style"
                            readOnly={readOnly}
                            mode="dialog"
                            label="Style"
                            description="A script that returns the style of the element as an object. This should conform to CSSProperties"
                        />

                    </SettingsFormItem>
                    <SettingsFormItem name="stylingBox">
                        <StyleBox />
                    </SettingsFormItem>
                </>

            )
        }
    ].filter(panel => !omitted.includes(panel.label)).map((panel, i) => ({ ...panel, key: `${i + 1}` }));

    const activateAllStylePanels = () => stylePanels([]).map(panel => panel.key);

    const tabs = [
        {
            key: "display",
            tab: "Display",
            content: (
                <>
                    <ContextPropertyAutocomplete
                        id="415cc8ec-2fd1-4c5a-88e2-965153e16069"
                        readOnly={readOnly}
                        defaultModelType={designerModelType ?? formSettings.modelType}
                        formData={model}
                        onValuesChange={onValuesChange}
                    />
                    <SettingsFormItem name="label" label="Label" jsSetting labelProps={{ hideLabel: model.hideLabel, labelAlign: model.labelAlign, onValuesChange }}>
                        <Input readOnly={readOnly || model.hideLabel} />
                    </SettingsFormItem>
                    <SettingsFormItem name="textType" label="Type" required>
                        <Select>
                            <Option value="text">Text</Option>
                            <Option value="password">Password</Option>
                        </Select>
                    </SettingsFormItem>
                    <SettingsFormItem name="placeholder" label="Placeholder" jsSetting>
                        <Input readOnly={readOnly} />
                    </SettingsFormItem>

                    <SettingsFormItem name="description" label="Description" jsSetting>
                        <TextArea readOnly={readOnly} />
                    </SettingsFormItem>

                    <PrefixSuffixComponent readOnly={readOnly} model={model} onChange={onValuesChange} />

                    <SettingsFormItem type='horizontal' name="passEmptyStringByDefault" label="Empty as default" valuePropName="checked" jsSetting tooltip='Whether the component should be initialized with an empty string'>
                        <Switch disabled={readOnly} />
                    </SettingsFormItem>

                    <SettingsFormItem name="initialValue" label="Default Value" hidden={model.passEmptyStringByDefault} jsSetting tooltip='Enter default value of component. (formData, formMode, globalState) are exposed'>
                        <Input readOnly={readOnly} />
                    </SettingsFormItem>

                    <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting type='horizontal'>
                        <Switch disabled={readOnly} />
                    </SettingsFormItem>

                    <SettingsFormItem name="editMode" label="Edit mode" jsSetting>
                        <ReadOnlyModeSelector readOnly={readOnly} />
                    </SettingsFormItem>
                </>
            )
        },
        {
            key: "events",
            tab: "Events",
            content: (
                <>
                    <SettingsFormItem name="onChangeCustom" label="On Change">
                        <CodeEditor
                            propertyName="onChangeCustom"
                            readOnly={readOnly}
                            mode="dialog"
                            label="On Change"
                            description="Enter custom eventhandler on changing of event. (form, event) are exposed"
                        />
                    </SettingsFormItem>

                    <SettingsFormItem name="onFocusCustom" label="On Focus">
                        <CodeEditor
                            propertyName="onFocusCustom"
                            readOnly={readOnly}
                            mode="dialog"
                            label="On Focus"
                            description="Enter custom eventhandler on focus of event. (form, event) are exposed"
                        />
                    </SettingsFormItem>

                    <SettingsFormItem name="onBlurCustom" label="On Blur">
                        <CodeEditor
                            propertyName="onBlurCustom"
                            readOnly={readOnly}
                            mode="dialog"
                            label="On Blur"
                            description="Enter custom eventhandler on focus of event. (form, event) are exposed"
                        />
                    </SettingsFormItem>
                </>
            )
        },
        {
            key: "validation",
            tab: "Validation",
            content: (
                <>
                    <SettingsFormItem name="validate.required" label="Required" valuePropName="checked" jsSetting type='horizontal'>
                        <Switch disabled={readOnly} />
                    </SettingsFormItem>

                    <SettingsFormItem name="validate.minLength" label="Min Length" jsSetting>
                        <Input type="number" readOnly={readOnly} />
                    </SettingsFormItem>

                    <SettingsFormItem name="validate.maxLength" label="Max Length" jsSetting>
                        <Input type="number" readOnly={readOnly} />
                    </SettingsFormItem>

                    <SettingsFormItem name="validate.pattern" label="Pattern" jsSetting>
                        <Input readOnly={readOnly} />
                    </SettingsFormItem>

                    <SettingsFormItem name="validationMessage" label="Validation Message" jsSetting>
                        <Input readOnly={readOnly} />
                    </SettingsFormItem>
                </>
            )
        },
        {
            key: "style",
            tab: "Style",
            content: (
                <ConfigProvider
                    theme={{
                        components: {
                            Collapse: {
                                contentBg: 'white',
                                contentPadding: 0,
                                colorBgBase: 'white',
                                colorBorder: 'white',
                                headerPadding: '0px 16px',
                            },
                        },
                    }}
                >
                    <Collapse defaultActiveKey={activateAllStylePanels()} style={{ paddingLeft: 0 }}>
                        <Collapse
                            items={stylePanels([])}
                        />
                    </Collapse>
                </ConfigProvider>
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