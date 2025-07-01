import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: any) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const validationTabId = nanoid();
    const dataTabId = nanoid();
    const appearanceTabId = nanoid();
    const eventsTabId = nanoid();
    const securityTabId = nanoid();
    const styleRouterId = nanoid();

    return {
        components: new DesignerToolbarSettings(data)
            .addSearchableTabs({
                id: searchableTabsId,
                propertyName: 'settingsTabs',
                parentId: 'root',
                label: 'Settings',
                hideLabel: true,
                labelAlign: 'right',
                size: 'small',
                tabs: [
                    {
                        key: 'common',
                        title: 'Common',
                        id: commonTabId,
                        components: [...new DesignerToolbarSettings()
                            .addContextPropertyAutocomplete({
                                id: nanoid(),
                                propertyName: 'propertyName',
                                parentId: commonTabId,
                                label: 'Property Name',
                                size: 'small',
                                validate: {
                                    required: true
                                },
                                styledLabel: true,
                                jsSetting: true,
                            })
                            .addLabelConfigurator({
                                id: nanoid(),
                                propertyName: 'hideLabel',
                                label: 'Label',
                                parentId: commonTabId,
                                hideLabel: true,
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        type: 'textField',
                                        id: nanoid(),
                                        propertyName: 'placeholder',
                                        label: 'Placeholder',
                                        jsSetting: true,
                                    },
                                    {
                                        type: 'textArea',
                                        id: nanoid(),
                                        propertyName: 'description',
                                        label: 'Tooltip',
                                        jsSetting: true,
                                    }
                                ],
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        type: 'editModeSelector',
                                        id: nanoid(),
                                        propertyName: 'editMode',
                                        label: 'Edit Mode',
                                        jsSetting: true,
                                        defaultValue: 'inherited',
                                    },
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'data',
                        title: 'Data',
                        id: dataTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                inputs: [
                                    {
                                        type: 'numberField',
                                        id: nanoid(),
                                        propertyName: 'hourStep',
                                        label: 'Hour Step',
                                        min: 1,
                                        jsSetting: true,
                                    },
                                    {
                                        type: 'numberField',
                                        id: nanoid(),
                                        propertyName: 'minuteStep',
                                        label: 'Minute Step',
                                        min: 1,
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'numberField',
                                        propertyName: 'secondStep',
                                        label: 'Second Step',
                                        parentId: dataTabId,
                                        min: 1,
                                        jsSetting: true,
                                    },
                                    {
                                        type: 'textField',
                                        id: nanoid(),
                                        propertyName: 'format',
                                        label: 'Time Format',
                                        defaultValue: 'HH:mm',
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                inputs: [
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'inputReadOnly',
                                        label: 'Input Read-Only',
                                        defaultValue: false,
                                        tooltip: 'Set the readonly attribute of the input tag (avoids virtual keyboard on touch devices)',
                                        jsSetting: true,
                                    },
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'use12Hours',
                                        label: 'Use 12 Hours',
                                        defaultValue: false,
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                inputs: [
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'allowClear',
                                        label: 'Allow Clear',
                                        jsSetting: true,
                                    },
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'showNow',
                                        label: 'Show Now',
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                inputs: [
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'autoFocus',
                                        label: 'Auto Focus',
                                        defaultValue: false,
                                        jsSetting: true,
                                    },
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'hideDisabledOptions',
                                        label: 'Hide Disabled Options',
                                        tooltip: 'Whether to hide the options that cannot be selected',
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'range',
                                label: 'Range',
                                parentId: dataTabId,
                                defaultValue: false,
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'validation',
                        title: 'Validation',
                        id: validationTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'validate.required',
                                label: 'Required',
                                parentId: validationTabId,
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'events',
                        title: 'Events',
                        id: eventsTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'onChangeCustom',
                                label: 'On Change',
                                labelAlign: 'right',
                                tooltip: 'Enter custom event handler on changing of event. Multiple variables are exposed',
                                parentId: eventsTabId,
                                exposedVariables: [
                                    {
                                        name: 'data',
                                        description: 'Selected form values',
                                        type: 'object'
                                    },
                                    {
                                        name: 'form',
                                        description: 'Form instance',
                                        type: 'FormInstance'
                                    },
                                    {
                                        name: 'formMode',
                                        description: 'The form mode',
                                        type: "'readonly' | 'edit' | 'designer'"
                                    },
                                    {
                                        name: 'globalState',
                                        description: 'The global state of the application',
                                        type: 'object'
                                    },
                                    {
                                        name: 'http',
                                        description: 'axios instance used to make http requests',
                                        type: 'object'
                                    },
                                    {
                                        name: 'message',
                                        description: 'This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header',
                                        type: 'object'
                                    },
                                    {
                                        name: 'moment',
                                        description: 'The moment.js object',
                                        type: 'object'
                                    },
                                    {
                                        name: 'value',
                                        description: 'Component current value',
                                        type: 'object'
                                    },
                                    {
                                        name: 'setFormData',
                                        description: 'A function used to update the form data',
                                        type: '({ values: object, mergeValues: boolean}) => void'
                                    },
                                    {
                                        name: 'setGlobalState',
                                        description: 'Setting the global state of the application',
                                        type: '(payload: { key: string, data: any } ) => void'
                                    }
                                ],
                                wrapInTemplate: true,
                                templateSettings: {
                                    functionName: 'onChange'
                                },
                                availableConstantsExpression: "return metadataBuilder.object(\"constants\").addAllStandard().addString(\"timeString\", \"Time string value\").addObject(\"value\", \"Component current value\", undefined).build();"
                            })
                            .addSettingsInput({
                                id: '88c2d96c-b808-4316-8a36-701b09e5f6c7',
                                inputType: 'codeEditor',
                                propertyName: 'onFocusCustom',
                                label: 'On Focus',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on focus of event.',
                                parentId: 'Cc47W08MWrKdhoGqFKMI2'
                            })
                            .addSettingsInput({
                                id: '4a2b7329-1a89-45d1-a5b0-f66db21744b0',
                                inputType: 'codeEditor',
                                propertyName: 'onBlurCustom',
                                label: 'On Blur',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on blur of event.',
                                parentId: 'Cc47W08MWrKdhoGqFKMI2'
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'appearance',
                        title: 'Appearance',
                        id: appearanceTabId,
                        components: [...new DesignerToolbarSettings()
                            .addPropertyRouter({
                                id: styleRouterId,
                                propertyName: 'propertyRouter1',
                                componentName: 'propertyRouter',
                                label: 'Property router1',
                                labelAlign: 'right',
                                parentId: appearanceTabId,
                                hidden: false,
                                propertyRouteName: {
                                    _mode: "code",
                                    _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                                    _value: ""
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlStyle',
                                            label: 'Style',
                                            labelAlign: 'right',
                                            parentId: styleRouterId,
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: nanoid(),
                                                                inputs: [
                                                            {
                                                                type: 'switch',
                                                                id: nanoid(),
                                                                propertyName: 'hideBorder',
                                                                label: 'Hide Border',
                                                                jsSetting: true,
                                                            },
                                                            {
                                                                type: 'dropdown',
                                                                id: nanoid(),
                                                                propertyName: 'size',
                                                                label: 'Size',
                                                                allowClear: true,
                                                                jsSetting: true,
                                                                dropdownOptions: [
                                                                    { label: 'Small', value: 'small' },
                                                                    { label: 'Middle', value: 'middle' },
                                                                    { label: 'Large', value: 'large' }
                                                                ],
                                                            }
                                                        ]
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlCustomStyle',
                                            label: 'Custom Styles',
                                            labelAlign: 'right',
                                            parentId: styleRouterId,
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                                id: nanoid(),
                                                        inputType: 'codeEditor',
                                                        propertyName: 'style',
                                                        label: 'Style',
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                        exposedVariables: [
                                                            {
                                                                name: 'data',
                                                                description: 'Form values',
                                                                type: 'object'
                                                            },
                                                            {
                                                                name: 'globalState',
                                                                description: 'The global state',
                                                                type: 'object'
                                                            }
                                                        ],
                                                        wrapInTemplate: true,
                                                        templateSettings: {
                                                            functionName: 'getStyle'
                                                        },
                                                        availableConstantsExpression: "return metadataBuilder.object(\"constants\").addStandard([\"shesha:formData\", \"shesha:globalState\"]).build();"
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .toJson()
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'security',
                        title: 'Security',
                        id: securityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                parentId: securityTabId,
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    },
                ]
            })
            .toJson(),
        formSettings: {
            colon: false,
            layout: 'vertical' as FormLayout,
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        }
    };
};