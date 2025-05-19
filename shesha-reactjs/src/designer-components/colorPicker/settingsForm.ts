import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: any) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const dataTabId = nanoid();
    const eventsTabId = nanoid();
    const appearanceTabId = nanoid();
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
                    //common
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
                                        type: 'textArea',
                                        id: nanoid(),
                                        propertyName: 'description',
                                        label: 'Tooltip',
                                        jsSetting: true,
                                    },
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
                                        size: 'small',
                                        jsSetting: true,
                                        defaultValue: 'inherited',
                                    },
                                    {
                                        id: nanoid(),
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        parentId: styleRouterId,
                                        type: 'switch',
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .toJson()
                        ]
                    },
                    //data
                    {
                        key: 'data',
                        title: 'Data',
                        id: dataTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'textField',
                                propertyName: 'title',
                                label: 'Title',
                                parentId: dataTabId,
                                jsSetting: true,
                                description: 'Title shown at the top of the color picker',
                                placeholder: 'Select color',
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
                                        propertyName: 'showText',
                                        label: 'Show Color Code',
                                        tooltip: 'Shows the color value (hex/rgb) alongside the color preview',
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        propertyName: 'disabledAlpha',
                                        label: 'Disable Opacity',
                                        type: 'switch',
                                        tooltip: 'Removes the opacity/transparency option from the color picker',
                                        jsSetting: true,
                                    }
                                ]
                            })
                            .toJson()
                        ]
                    },
                    //events
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
                                tooltip: 'Enter custom eventhandler on changing of event.',
                                parentId: eventsTabId
                            })
                            .toJson()
                        ]
                    },
                    //appearance
                    {
                        key: 'appearance',
                        title: 'Appearance',
                        id: appearanceTabId,
                        components: [...new DesignerToolbarSettings()
                            .addCollapsiblePanel({
                                id: nanoid(),
                                propertyName: 'stylingBox',
                                label: 'Styles',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: styleRouterId,
                                collapsible: 'header',
                                content: {
                                    id: nanoid(),
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: nanoid(),
                                            inputType: 'dropdown',
                                            propertyName: 'size',
                                            label: 'Size',
                                            parentId: styleRouterId,
                                            jsSetting: true,
                                            defaultValue: 'middle',
                                            dropdownOptions: [
                                                { label: 'Small', value: 'small' },
                                                { label: 'Middle', value: 'middle' },
                                                { label: 'Large', value: 'large' }
                                            ],
                                        })
                                        .toJson()
                                    ]
                                }
                            })
                            .addCollapsiblePanel({
                                id: nanoid(),
                                propertyName: 'marginPadding',
                                label: 'Margin & Padding',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: styleRouterId,
                                collapsible: 'header',
                                content: {
                                    id: nanoid(),
                                    components: [...new DesignerToolbarSettings()
                                        .addStyleBox({
                                            id: nanoid(),
                                            label: 'Margin & Padding',
                                            hideLabel: true,
                                            propertyName: 'stylingBox',
                                        })
                                        .toJson()
                                    ]
                                }
                            })
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
                                            propertyName: 'customStyles',
                                            label: 'Custom Styles',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        id: nanoid(),
                                                        inputType: 'codeEditor',
                                                        propertyName: 'style',
                                                        label: 'Style',
                                                        parentId: styleRouterId,
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
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
                    //security
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
                                size: 'small',
                                parentId: securityTabId,
                                tooltip: 'Enter a list of permissions that should be associated with this component'
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