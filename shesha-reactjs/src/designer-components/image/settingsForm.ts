import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { positionOptions } from '../_settings/utils/background/utils';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const validationTabId = nanoid();
    const appearanceTabId = nanoid();
    const securityTabId = nanoid();
    const styleRouterId = nanoid();
    const dimensionsStylePnlId = nanoid();
    const sizePositionPnlId = nanoid();
    const borderStylePnlId = nanoid();
    const shadowStylePnlId = nanoid();

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
                        key: '1',
                        title: 'Common',
                        id: commonTabId,
                        components: [...new DesignerToolbarSettings()
                            .addContextPropertyAutocomplete({
                                id: nanoid(),
                                propertyName: 'propertyName',
                                label: 'Property Name',
                                parentId: commonTabId,
                                size: 'small',
                                styledLabel: true,
                                validate: {
                                    required: true,
                                },
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
                                propertyName: 'alt',
                                label: 'Alt Text',
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        type: 'textField',
                                        id: nanoid(),
                                        propertyName: 'alt',
                                        label: 'Alt Text',
                                        jsSetting: true,
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'textArea',
                                        propertyName: 'description',
                                        label: 'Tooltip',
                                        parentId: commonTabId,
                                        jsSetting: true,
                                    }
                                ]
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
                                    },
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                        layout: 'horizontal',
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                propertyName: 'allowPreview',
                                label: 'Allow Preview',
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'allowPreview',
                                        label: 'Allow Preview',
                                        jsSetting: true,
                                    },
                                    {
                                        id: nanoid(),
                                        propertyName: 'allowedFileTypes',
                                        label: 'Allowed File Types',
                                        type: 'editableTagGroupProps',
                                        parentId: commonTabId,
                                        tooltip: 'Enter the file types that are allowed to be uploaded e.g .jpg, .png, .gif',
                                    }
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                parentId: commonTabId,
                                label: "Image Source Type",
                                jsSetting: true,
                                propertyName: "dataSource",
                                inputType: "radio",
                                buttonGroupOptions: [
                                    {
                                        title: "StoredFile",
                                        icon: "DatabaseOutlined",
                                        value: "storedFile",
                                    },
                                    {
                                        title: "Url",
                                        icon: "LinkOutlined",
                                        value: "url",
                                    },
                                    {
                                        title: "Base64",
                                        icon: "PictureOutlined",
                                        value: "base64",
                                    }
                                ],
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [{
                                    type: 'textField',
                                    id: nanoid(),
                                    propertyName: "url",
                                    jsSetting: false,
                                    label: "URL",
                                }],
                                hidden: {
                                    _code: "return getSettingValue(data?.dataSource) !== 'url';",
                                    _mode: "code",
                                    _value: false
                                },
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [{
                                    id: nanoid(),
                                    type: "imageUploader",
                                    parentId: commonTabId,
                                    label: "Upload Image",
                                    propertyName: "base64",
                                }],
                                hidden: {
                                    _code: "return getSettingValue(data?.dataSource) !== 'base64';",
                                    _mode: "code",
                                    _value: false
                                },
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                hidden: {
                                    _code: "return getSettingValue(data?.dataSource) !== 'storedFile';",
                                    _mode: "code",
                                    _value: false
                                },
                                inputs: [
                                    {
                                        type: 'textField',
                                        id: nanoid(),
                                        jsSetting: false,
                                        propertyName: "storedFileId",
                                        label: "File ID"
                                    }
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Validation',
                        id: validationTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'validate.required',
                                label: 'Required',
                                inputType: 'switch',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: validationTabId
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '3',
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
                                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                                    _value: ""
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlDimensions',
                                            label: 'Dimensions',
                                            parentId: styleRouterId,
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: dimensionsStylePnlId,
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: dimensionsStylePnlId,
                                                        inline: true,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Width",
                                                                width: 85,
                                                                propertyName: "dimensions.width",
                                                                icon: "widthIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Min Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.minWidth",
                                                                icon: "minWidthIcon",
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Max Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.maxWidth",
                                                                icon: "maxWidthIcon",
                                                            }
                                                        ]
                                                    })
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: dimensionsStylePnlId,
                                                        inline: true,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Height",
                                                                width: 85,
                                                                propertyName: "dimensions.height",
                                                                icon: "heightIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Min Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.minHeight",
                                                                icon: "minHeightIcon",
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Max Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.maxHeight",
                                                                icon: "maxHeightIcon",
                                                            }
                                                        ]
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlsize-position-',
                                            label: 'Picture Styles',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: sizePositionPnlId,
                                                components: [
                                                    ...new DesignerToolbarSettings()
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: sizePositionPnlId,
                                                            inputs: [
                                                                {
                                                                    type: 'dropdown',
                                                                    id: nanoid(),
                                                                    label: "Object Fit",
                                                                    propertyName: "objectFit",
                                                                    dropdownOptions: [
                                                                        {
                                                                            value: "cover",
                                                                            label: "Cover"
                                                                        },
                                                                        {
                                                                            value: "contain",
                                                                            label: "Contain"
                                                                        },
                                                                        {
                                                                            value: "fill",
                                                                            label: "Fill"
                                                                        },
                                                                        {
                                                                            value: "auto",
                                                                            label: "Auto"
                                                                        }
                                                                    ],
                                                                },
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: nanoid(),
                                                                    label: "Object Position",
                                                                    customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                                                    propertyName: "objectPosition",
                                                                    dropdownOptions: positionOptions,
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: sizePositionPnlId,
                                                            inputs: [
                                                                {
                                                                    id: nanoid(),
                                                                    parentId: sizePositionPnlId,
                                                                    type: 'dropdown',
                                                                    label: 'Filter',
                                                                    propertyName: 'filter',
                                                                    dropdownOptions: [
                                                                        {
                                                                            value: 'none',
                                                                            label: 'None'
                                                                        },
                                                                        {
                                                                            value: 'grayscale',
                                                                            label: 'Grayscale'
                                                                        },
                                                                        {
                                                                            value: 'sepia',
                                                                            label: 'Sepia'
                                                                        },
                                                                        {
                                                                            value: 'blur',
                                                                            label: 'Blur'
                                                                        },
                                                                        {
                                                                            value: 'brightness',
                                                                            label: 'Brightness'
                                                                        },
                                                                        {
                                                                            value: 'contrast',
                                                                            label: 'Contrast'
                                                                        },
                                                                        {
                                                                            value: 'hue-rotate',
                                                                            label: 'Hue Rotate'
                                                                        },
                                                                        {
                                                                            value: 'invert',
                                                                            label: 'Invert'
                                                                        },
                                                                        {
                                                                            value: 'saturate',
                                                                            label: 'Saturate'
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    id: nanoid(),
                                                                    label: 'Filter Intensity',
                                                                    propertyName: 'filterIntensity',
                                                                    type: 'numberField',
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInput({
                                                            parentId: sizePositionPnlId,
                                                            id: nanoid(),
                                                            label: 'Opacity',
                                                            propertyName: 'opacity',
                                                            inputType: 'numberField',
                                                        })
                                                        .toJson()
                                                ],
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlBorderStyle',
                                            label: 'Border',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: borderStylePnlId,
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: borderStylePnlId,
                                                        hidden: { _code: 'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'button',
                                                                id: nanoid(),
                                                                label: "Border",
                                                                hideLabel: true,
                                                                propertyName: "border.hideBorder",
                                                                icon: "EyeOutlined",
                                                                iconAlt: "EyeInvisibleOutlined"
                                                            },
                                                        ]
                                                    })
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: borderStylePnlId,
                                                        components: getBorderInputs() as any
                                                    })
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: borderStylePnlId,
                                                        components: getCornerInputs() as any
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlShadowStyle',
                                            label: 'Shadow',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: shadowStylePnlId,
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: shadowStylePnlId,
                                                        inline: true,
                                                        inputs: [
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Offset X',
                                                                hideLabel: true,
                                                                tooltip: 'Offset X',
                                                                width: 80,
                                                                icon: "offsetHorizontalIcon",
                                                                propertyName: 'shadow.offsetX',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Offset Y',
                                                                hideLabel: true,
                                                                tooltip: 'Offset Y',
                                                                width: 80,
                                                                icon: 'offsetVerticalIcon',
                                                                propertyName: 'shadow.offsetY',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Blur',
                                                                hideLabel: true,
                                                                tooltip: 'Blur Radius',
                                                                width: 80,
                                                                icon: 'blurIcon',
                                                                propertyName: 'shadow.blurRadius',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Spread',
                                                                hideLabel: true,
                                                                tooltip: 'Spread Radius',
                                                                width: 80,
                                                                icon: 'spreadIcon',
                                                                propertyName: 'shadow.spreadRadius',
                                                            },
                                                            {
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                label: 'Color',
                                                                hideLabel: true,
                                                                propertyName: 'shadow.color',
                                                            },
                                                        ],
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'stylingBox',
                                            label: 'Margin & Padding',
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addStyleBox({
                                                        id: nanoid(),
                                                        label: 'Margin Padding',
                                                        hideLabel: true,
                                                        propertyName: 'stylingBox',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'customStyle',
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
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .toJson()]
                            }).toJson()]
                    },
                    {
                        key: '5',
                        title: 'Security',
                        id: securityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                size: 'small',
                                parentId: securityTabId
                            })
                            .toJson()
                        ]
                    }
                ]
            }).toJson(),
        formSettings: {
            colon: false,
            layout: 'vertical' as FormLayout,
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        }
    };
};