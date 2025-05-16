import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { onAddNewItem } from './utils';
import { getItemSettings } from './itemSettings';
import { fontTypes, fontWeights } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';

export const getSettings = () => {
    // Generate unique IDs for major components
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const appearanceTabId = nanoid();
    const securityTabId = nanoid();

    // Generate unique IDs for style panels
    const styleRouterId = nanoid();
    const fontStylePanelId = nanoid();
    const fontStyleContentId = nanoid();
    const dimensionsPanelId = nanoid();
    const dimensionsContentId = nanoid();
    const borderPanelId = nanoid();
    const borderContentId = nanoid();
    const backgroundPanelId = nanoid();
    const backgroundContentId = nanoid();
    const shadowPanelId = nanoid();
    const shadowContentId = nanoid();
    const marginPaddingPanelId = nanoid();
    const marginPaddingContentId = nanoid();
    const customStylePanelId = nanoid();
    const customStyleContentId = nanoid();
    const additionalStylesPanelId = nanoid();
    const additionalStylesContentId = nanoid();

    return {
        components: new DesignerToolbarSettings()
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
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'textField',
                                propertyName: 'componentName',
                                label: 'Component Name',
                                parentId: 'root',
                                size: 'small',
                                hidden: { _code: 'return  getSettingValue(data?.hidden);', _mode: 'code', _value: false } as any,
                                validate: {
                                    required: true,
                                },
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'dropdown',
                                        propertyName: 'wizardType',
                                        label: 'Wizard Type',
                                        parentId: 'root',
                                        inputType: 'dropdown',
                                        jsSetting: true,
                                        dropdownOptions: [
                                            { value: 'default', label: 'Default' },
                                            { value: 'navigation', label: 'Navigation' }
                                        ]
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'dropdown',
                                        propertyName: 'direction',
                                        label: 'Direction',
                                        parentId: 'root',
                                        inputType: 'dropdown',
                                        tooltip: 'To specify the direction of the step bar',
                                        jsSetting: true,
                                        dropdownOptions: [
                                            { value: 'vertical', label: 'Vertical' },
                                            { value: 'horizontal', label: 'Horizontal' }
                                        ]
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'dropdown',
                                        propertyName: 'labelPlacement',
                                        label: 'Label Placement',
                                        parentId: 'root',
                                        inputType: 'dropdown',
                                        tooltip: 'To specify the label placement',
                                        jsSetting: true,
                                        dropdownOptions: [
                                            { value: 'vertical', label: 'Vertical' },
                                            { value: 'horizontal', label: 'Horizontal' }
                                        ]
                                    },
                                    {
                                        id: nanoid(),
                                        propertyName: 'defaultActiveStep',
                                        label: 'Default Active Step',
                                        parentId: 'root',
                                        type: 'dropdown',
                                        tooltip: 'This will be the default step that is active',
                                        jsSetting: true,
                                        dropdownOptions: { _code: 'return  getSettingValue(data?.steps)?.map((item) => ({ ...item, label: item?.title, value: item?.id }));', _mode: 'code', _value: 0 } as any
                                    }
                                ]
                            })
                            .addSettingsInputRow(
                                {
                                    id: nanoid(),
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            type: 'itemListConfiguratorModal',
                                            propertyName: 'steps',
                                            label: 'Configure Steps',
                                            parentId: 'root',
                                            buttonTextReadOnly: 'View Wizard Steps',
                                            onAddNewItem: onAddNewItem,
                                            listItemSettingsMarkup: getItemSettings(),
                                            hidden: false,
                                            modalSettings: {
                                                title: 'Configure Wizard Steps',
                                                header: 'Here you can configure the wizard steps by adjusting their settings and ordering.'
                                            },
                                            modalReadonlySettings: {
                                                title: 'View Wizard Steps',
                                                header: 'Here you can view wizard steps configuration'
                                            },
                                            buttonText: 'Configure Steps',
                                        },
                                        {
                                            id: nanoid(),
                                            propertyName: 'hidden',
                                            label: 'Hide',
                                            parentId: 'root',
                                            type: 'switch',
                                            jsSetting: true,
                                        }
                                    ]
                                }
                            )
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
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
                                            id: fontStylePanelId,
                                            propertyName: 'pnlFontStyle',
                                            label: 'Font',
                                            labelAlign: 'right',
                                            parentId: styleRouterId,
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: fontStyleContentId,
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: fontStyleContentId,
                                                        inline: true,
                                                        propertyName: 'font',
                                                        inputs: [
                                                            {
                                                                type: 'dropdown',
                                                                id: nanoid(),
                                                                label: 'Family',
                                                                propertyName: 'font.type',
                                                                hideLabel: true,
                                                                dropdownOptions: fontTypes,
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Size',
                                                                propertyName: 'font.size',
                                                                hideLabel: true,
                                                                width: 50,
                                                            },
                                                            {
                                                                type: 'dropdown',
                                                                id: nanoid(),
                                                                label: 'Weight',
                                                                propertyName: 'font.weight',
                                                                hideLabel: true,
                                                                tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                                                dropdownOptions: fontWeights,
                                                                width: 100,
                                                            },
                                                            {
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                label: 'Color',
                                                                hideLabel: true,
                                                                propertyName: 'font.color',
                                                            }
                                                        ],
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: dimensionsPanelId,
                                            propertyName: 'pnlDimensions',
                                            label: 'Dimensions',
                                            parentId: styleRouterId,
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: dimensionsContentId,
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: dimensionsContentId,
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
                                                        parentId: dimensionsContentId,
                                                        inline: true,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Height",
                                                                width: 85,
                                                                propertyName: "dimensions.height",
                                                                icon: "heightIcon",
                                                                tooltip: "This is the height of the body of the wizard. You can use any unit (%, px, em, etc). px by default if without unit"
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
                                            id: borderPanelId,
                                            propertyName: 'pnlBorderStyle',
                                            label: 'Border',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: borderContentId,
                                                components: [...new DesignerToolbarSettings()

                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: borderContentId,
                                                        components: getBorderInputs() as any
                                                    })
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: borderContentId,
                                                        components: getCornerInputs() as any
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: backgroundPanelId,
                                            propertyName: 'pnlBackgroundStyle',
                                            label: 'Background',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: backgroundContentId,
                                                components: [
                                                    ...new DesignerToolbarSettings()
                                                        .addSettingsInput({
                                                            id: nanoid(),
                                                            parentId: backgroundContentId,
                                                            label: "Type",
                                                            jsSetting: false,
                                                            propertyName: "background.type",
                                                            inputType: "radio",
                                                            tooltip: "Select a type of background",
                                                            buttonGroupOptions: backgroundTypeOptions,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: backgroundContentId,
                                                            inputs: [{
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                label: "Color",
                                                                propertyName: "background.color",
                                                                hideLabel: true,
                                                                jsSetting: false,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: backgroundContentId,
                                                            inputs: [{
                                                                type: 'multiColorPicker',
                                                                id: nanoid(),
                                                                propertyName: "background.gradient.colors",
                                                                label: "Colors",
                                                                jsSetting: false,
                                                            }
                                                            ],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                            hideLabel: true,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: backgroundContentId,
                                                            inputs: [{
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                propertyName: "background.url",
                                                                jsSetting: false,
                                                                label: "URL",
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: backgroundContentId,
                                                            inputs: [{
                                                                type: 'imageUploader',
                                                                id: nanoid(),
                                                                propertyName: 'background.uploadFile',
                                                                label: "Image",
                                                                jsSetting: false,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: backgroundContentId,
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    type: 'textField',
                                                                    id: nanoid(),
                                                                    jsSetting: false,
                                                                    propertyName: "background.storedFile.id",
                                                                    label: "File ID"
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: backgroundContentId,
                                                            inline: true,
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: nanoid(),
                                                                    label: "Size",
                                                                    hideLabel: true,
                                                                    propertyName: "background.size",
                                                                    dropdownOptions: sizeOptions,
                                                                },
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: nanoid(),
                                                                    label: "Position",
                                                                    hideLabel: true,
                                                                    propertyName: "background.position",
                                                                    dropdownOptions: positionOptions
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: backgroundContentId,
                                                            inputs: [{
                                                                type: 'radio',
                                                                id: nanoid(),
                                                                label: 'Repeat',
                                                                hideLabel: true,
                                                                propertyName: 'background.repeat',
                                                                inputType: 'radio',
                                                                buttonGroupOptions: repeatOptions,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                        })
                                                        .toJson()
                                                ],
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: shadowPanelId,
                                            propertyName: 'pnlShadowStyle',
                                            label: 'Shadow',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: shadowContentId,
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: shadowContentId,
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
                                            id: marginPaddingPanelId,
                                            propertyName: 'stylingBox',
                                            label: 'Margin & Padding',
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: marginPaddingContentId,
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
                                            id: customStylePanelId,
                                            propertyName: 'customStyle',
                                            label: 'Custom Styles',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: customStyleContentId,
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        id: nanoid(),
                                                        inputType: 'codeEditor',
                                                        propertyName: 'style',
                                                        hideLabel: false,
                                                        label: 'Style',
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: additionalStylesPanelId,
                                            propertyName: 'additionalStyles',
                                            label: 'Additional Styles',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: additionalStylesContentId,
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        id: nanoid(),
                                                        propertyName: 'buttonsLayout',
                                                        label: 'Buttons Layout',
                                                        parentId: 'root',
                                                        inputType: 'dropdown',
                                                        tooltip: 'How you want the steps buttons to be aligned',
                                                        jsSetting: true,
                                                        dropdownOptions: [
                                                            { value: 'left', label: 'Left' },
                                                            { value: 'right', label: 'Right' },
                                                            { value: 'spaceBetween', label: 'Space between' }
                                                        ]
                                                    })
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: additionalStylesContentId,
                                                        inputs: [
                                                            {
                                                                id: nanoid(),
                                                                parentId: additionalStylesContentId,
                                                                type: 'colorPicker',
                                                                propertyName: 'primaryBgColor',
                                                                hideLabel: false,
                                                                label: 'Primary Color'
                                                            },
                                                            {
                                                                id: nanoid(),
                                                                parentId: additionalStylesContentId,
                                                                type: 'colorPicker',
                                                                propertyName: 'primaryTextColor',
                                                                hideLabel: false,
                                                                defaultValue: '#fff',
                                                                label: 'Primary Text Color'
                                                            }
                                                        ]
                                                    })
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: additionalStylesContentId,
                                                        inputs: [
                                                            {
                                                                id: nanoid(),
                                                                parentId: additionalStylesContentId,
                                                                type: 'colorPicker',
                                                                propertyName: 'secondaryBgColor',
                                                                hideLabel: false,
                                                                label: 'Secondary Color'
                                                            },
                                                            {
                                                                id: nanoid(),
                                                                parentId: additionalStylesContentId,
                                                                type: 'colorPicker',
                                                                propertyName: 'secondaryTextColor',
                                                                hideLabel: false,
                                                                label: 'Secondary Text Color'
                                                            }
                                                        ]
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .toJson()]
                            }).toJson()]
                    },
                    {
                        key: '4',
                        title: 'Security',
                        id: securityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'permissions',
                                label: 'Permissions',
                                parentId: 'root',
                                inputType: 'permissions',
                                tooltip: 'Enter a list of permissions that should be associated with this component',
                                jsSetting: true
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