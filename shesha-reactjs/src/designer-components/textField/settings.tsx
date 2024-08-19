import { CodeEditor } from '../codeEditor/codeEditor';
import React, { FC, useCallback, useEffect, useRef } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';
import { Switch, Input, Select, Radio, Tabs, Collapse, ConfigProvider } from 'antd';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITextFieldComponentProps } from './interfaces';
import { IconPicker } from '@/components';
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
import { AlignLeftOutlined, AlignRightOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Panel } = Collapse;

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {
    const { readOnly } = props;
    const { Option } = Select;
    const { model, onValuesChange } = useSettingsForm<ITextFieldComponentProps>();

    const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
    const { formSettings } = useForm();

    const settingsPanelRef = useRef<HTMLDivElement>(null);

    const search = useCallback((e: React.ChangeEvent<HTMLInputElement>, active) => {
        const searchQuery = e.target.value;
        const activePanel = settingsPanelRef.current.querySelector(`.${active}`);

        if (activePanel) {
            activePanel.querySelectorAll('.ant-form-item-label').forEach((label) => {
                if (label.textContent?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    label.parentElement.style.display = 'block';
                } else {
                    label.parentElement.style.display = 'none';
                }
            });
        }
    }, [settingsPanelRef]);

    const renderSearchInput = (group) => {
        return (
            <Input
                placeholder="Search"
                allowClear
                style={{ marginBottom: 10 }}
                onChange={(e) => search(e, group)}
            />);
    }
    return (
        <ConfigProvider
            theme={{
                components: {
                    Collapse: {
                        contentPadding: '0',
                        contentBg: 'red',
                    },
                },
            }}
        >
            <div ref={settingsPanelRef}>
                <Tabs defaultActiveKey="display" type='card'>
                    <TabPane tab="Display" key="display" className='display'>
                        {renderSearchInput('display')}
                        <ContextPropertyAutocomplete
                            id="415cc8ec-2fd1-4c5a-88e2-965153e16069"
                            readOnly={readOnly}
                            defaultModelType={designerModelType ?? formSettings.modelType}
                            formData={model}
                            onValuesChange={onValuesChange}
                        />

                        <SettingsFormItem name="label" label="Label" jsSetting>
                            <Input readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem readOnly={readOnly} name="labelAlign" label="Label Align" jsSetting>
                            <Radio.Group value={model?.labelAlign} onChange={(e) => onValuesChange({ labelAlign: e.target.value })}>
                                {[{ value: 'left', icon: <AlignLeftOutlined /> }, { value: 'right', icon: <AlignRightOutlined /> }].map(({ value, icon }) => (
                                    <Radio.Button key={value} value={value} title={value}>{icon}</Radio.Button>
                                ))}
                            </Radio.Group>
                        </SettingsFormItem>

                        <SettingsFormItem name="hideLabel" label="Hide Label" valuePropName="checked" jsSetting>
                            <Switch disabled={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="texType" label="Type">
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

                        <SettingsFormItem name="prefix" label="Prefix" required>
                            <Input readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="prefixIcon" label="Prefix Icon" jsSetting>
                            <IconPicker readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="suffix" label="Suffix" jsSetting>
                            <Input readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="suffixIcon" label="Suffix Icon" jsSetting>
                            <IconPicker readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="initialValue" label="Default Value" jsSetting tooltip='Enter default value of component. (formData, formMode, globalState) are exposed'>
                            <Input readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="passEmptyStringByDefault" label="Empty as default" valuePropName="checked" jsSetting tooltip='Whether the component should be initialized with an empty string'>
                            <Switch disabled={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
                            <Switch disabled={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="editMode" label="Edit mode" jsSetting>
                            <ReadOnlyModeSelector readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="hideBorder" label="Hide Border" valuePropName="checked" jsSetting>
                            <Switch disabled={readOnly} />
                        </SettingsFormItem>
                    </TabPane>

                    <TabPane tab="Events" key="events" className='events'>
                        {renderSearchInput('events')}

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
                    </TabPane>

                    <TabPane tab="Validation" key="validation" className='validation'>
                        {renderSearchInput('validation')}

                        <SettingsFormItem name="validate.required" label="Required" valuePropName="checked" jsSetting>
                            <Switch disabled={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="validate.minLength" label="Min Length" jsSetting>
                            <Input readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="validate.maxLength" label="Max Length" jsSetting>
                            <Input readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="validate.message" label="Message" jsSetting>
                            <Input readOnly={readOnly} />
                        </SettingsFormItem>

                        <SettingsFormItem name="validate.validator" label="Validator" jsSetting tooltip='Enter custom validator logic for form.item rules. Returns a Promise'>
                            <CodeEditor
                                propertyName="validate.validator"
                                readOnly={readOnly}
                                mode="dialog"
                                label="Validator"
                            />
                        </SettingsFormItem>
                    </TabPane>

                    <TabPane tab="Style" key="style" className='style'>
                        {renderSearchInput('style')}

                        <SettingsFormItem name="style" label="Style">
                            <CodeEditor
                                propertyName="style"
                                readOnly={readOnly}
                                mode="dialog"
                                label="Style"
                                description="A script that returns the style of the element as an object. This should conform to CSSProperties"
                            />
                        </SettingsFormItem>
                        <Collapse defaultActiveKey={['1']} bordered={false}>
                            <Panel header="Font" key="1">
                                <FontComponent readOnly={readOnly} onChange={onValuesChange} value={model.font} />
                            </Panel>
                            <Panel header="Size" key="2">
                                <SizeComponent readOnly={readOnly} onChange={onValuesChange} value={model.dimensions} noOverflow />
                            </Panel>
                            <Panel header="Border" key="3">
                                <BorderComponent readOnly={readOnly} onChange={onValuesChange} value={model.border} model={model} />
                            </Panel>
                            <Panel header="Background" key="4">
                                <BackgroundConfigurator readOnly={readOnly} onValuesChange={onValuesChange} value={model.background} model={model} />
                            </Panel>
                        </Collapse>
                        <StyleBox />
                    </TabPane>

                    <TabPane tab="Security" key="security" className='security'>
                        {renderSearchInput('security')}

                        <SettingsFormItem
                            jsSetting
                            label="Permissions"
                            name="permissions"
                            initialValue={model.permissions}
                            tooltip="Enter a list of permissions that should be associated with this component"
                        >
                            <PermissionAutocomplete readOnly={readOnly} />
                        </SettingsFormItem>
                    </TabPane>
                </Tabs>
            </div>
        </ConfigProvider>
    );
};

export const TextFieldSettingsForm: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) =>
    SettingsForm<any>({ ...props, children: <TextFieldSettings {...props} /> });
