import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { onAddNewItem } from './utils';
import { getItemSettings } from './itemSettings';
import { overflowOptions } from '../_settings/utils/dimensions/utils';
import { nanoid } from '@/utils/uuid';

export const getSettings = () => {

    const prefix = 'getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.tabPosition) === ';

    const hideConditions = {
        topLeft: 'return ' + prefix + '"top" || ' + prefix + '"left";',
        topRight: 'return ' + prefix + '"top" || ' + prefix + '"right";',
        bottomLeft: 'return ' + prefix + '"bottom" || ' + prefix + '"left";',
        bottomRight: 'return ' + prefix + '"bottom" || ' + prefix + '"right";',
    };

    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const appearanceTabId = nanoid();
    const securityTabId = nanoid();
    const styleRouterId = nanoid();

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
                        type: '',
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    id: nanoid(),
                                    inputType: 'textField',
                                    propertyName: 'componentName',
                                    label: 'Component Name',
                                    labelAlign: 'right',
                                    jsSetting: false,
                                    validate: { required: true },
                                    parentId: 'root'
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            type: 'dropdown',
                                            propertyName: 'defaultActiveKey',
                                            label: 'Default Active Tab',
                                            labelAlign: 'right',
                                            parentId: 'root',
                                            dropdownOptions: { _code: 'return  getSettingValue(data?.tabs)?._data?.map((item) => ({ ...item, label: item?.title, value: item?.id }));', _mode: 'code', _value: 0 } as any
                                        },
                                        {
                                            id: nanoid(),
                                            type: 'dropdown',
                                            propertyName: 'tabType',
                                            label: 'Tab Type',
                                            defaultValue: 'card',
                                            dropdownOptions: [
                                                { value: 'line', label: 'Line' },
                                                { value: 'card', label: 'Card' }
                                            ],
                                            jsSetting: false,
                                            labelAlign: 'right',
                                            parentId: 'root'
                                        }
                                    ]
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            type: 'itemListConfiguratorModal',
                                            propertyName: 'tabs',
                                            label: 'Tabs',
                                            labelAlign: 'right',
                                            parentId: 'root',
                                            buttonTextReadOnly: 'View Tab Panes',
                                            buttonText: 'Configure Tab Panes',
                                            listItemSettingsMarkup: getItemSettings(),
                                            onAddNewItem: onAddNewItem,
                                            hidden: false,
                                            modalSettings: {
                                                title: 'Configure Tab Panes',
                                                header: 'Here you can configure the tab panes by adjusting their settings and ordering.'
                                            },
                                            modalReadonlySettings: {
                                                title: 'View Tab Panes',
                                                header: 'Here you can view tab panes configuration'
                                            }
                                        },
                                        {
                                            id: nanoid(),
                                            type: 'switch',
                                            propertyName: 'hidden',
                                            label: 'Hide',
                                            jsSetting: true,
                                            labelAlign: 'right',
                                            parentId: 'root',
                                        }
                                    ]
                                })
                                .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Appearance',
                        type: '',
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
                                        .addSettingsInput({
                                            id: nanoid(),
                                            inputType: 'dropdown',
                                            propertyName: 'tabPosition',
                                            tooltip: "This will set the position for all buttons",
                                            defaultValue: 'top',
                                            label: 'Position',
                                            dropdownOptions: [
                                                { value: 'top', label: 'Top' },
                                                { value: 'bottom', label: 'Bottom' },
                                                { value: 'left', label: 'Left' },
                                                { value: 'right', label: 'Right' }
                                            ],
                                            labelAlign: 'right',
                                            parentId: 'root'
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlFontStyle',
                                            label: 'Font',
                                            labelAlign: 'right',
                                            parentId: styleRouterId,
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: 'fontStylePnl',
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
                                            id: nanoid(),
                                            propertyName: 'pnlDimensions',
                                            label: 'Dimensions',
                                            parentId: styleRouterId,
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: 'dimensionsStylePnl',
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
                                                        parentId: 'dimensionsStylePnl',
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
                                                    .addSettingsInput({
                                                        id: nanoid(),
                                                        parentId: 'displayCollapsiblePanel',
                                                        inline: true,
                                                        inputType: 'dropdown',
                                                        label: 'Overflow',
                                                        defaultValue: 'auto',
                                                        propertyName: 'dimensions.overflow',
                                                        dropdownOptions: overflowOptions
                                                    })
                                                    .toJson()
                                                ]
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
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: 'borderStylePnl',
                                                        components: getBorderInputs() as any
                                                    })
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: 'borderStylePnl',
                                                        components: getCornerInputs("", true, hideConditions) as any
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlTabLineColor',
                                            label: 'Line Color',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            hidden: { _code: 'return  getSettingValue(data?.tabType) !== "line";', _mode: 'code', _value: false } as any,
                                            content: {
                                                id: nanoid(),
                                                components: [
                                                    ...new DesignerToolbarSettings()
                                                        .addSettingsInput({
                                                            id: nanoid(),
                                                            parentId: 'tab-line-color-pnl',
                                                            inputType: 'colorPicker',
                                                            label: 'Color',
                                                            propertyName: 'tabLineColor',
                                                            jsSetting: false,
                                                        })
                                                        .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlBackgroundStyle',
                                            label: 'Background',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            hidden: { _code: 'return  getSettingValue(data?.tabType) === "line";', _mode: 'code', _value: false } as any,
                                            content: {
                                                id: nanoid(),
                                                components: [
                                                    ...new DesignerToolbarSettings()
                                                        .addSettingsInput({
                                                            id: nanoid(),
                                                            parentId: "backgroundStylePnl",
                                                            label: "Type",
                                                            jsSetting: false,
                                                            propertyName: "background.type",
                                                            inputType: "radio",
                                                            tooltip: "Select a type of background",
                                                            buttonGroupOptions: backgroundTypeOptions,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: "backgroundStylePnl",
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
                                                            parentId: "backgroundStylePnl",
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
                                                            parentId: "backgroundStylePnl",
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
                                                            parentId: 'backgroundStylePnl',
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
                                                            parentId: 'backgroundStylePnl',
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
                                                            parentId: 'backgroundStyleRow',
                                                            inline: true,
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: nanoid(),
                                                                    label: "Size",
                                                                    hideLabel: true,
                                                                    propertyName: "background.size",
                                                                    customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                                                    dropdownOptions: sizeOptions,
                                                                },
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: nanoid(),
                                                                    label: "Position",
                                                                    hideLabel: true,
                                                                    customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                                                    propertyName: "background.position",
                                                                    dropdownOptions: positionOptions,
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: 'backgroundStyleRow',
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
                                            id: nanoid(),
                                            propertyName: 'pnlShadowStyle',
                                            label: 'Shadow',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: 'shadowStylePnl',
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
                                            parentId: styleRouterId,
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
                                                        hideLabel: false,
                                                        label: 'Style',
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'cardStyle',
                                            label: 'Card Styles',
                                            labelAlign: 'right',
                                            collapsedByDefault: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addCollapsiblePanel({
                                                        id: nanoid(),
                                                        propertyName: 'tabCardFontStyle',
                                                        label: 'Font',
                                                        labelAlign: 'right',
                                                        parentId: nanoid(),
                                                        ghost: true,
                                                        collapsible: 'header',
                                                        content: {
                                                            id: nanoid(),
                                                            components: [...new DesignerToolbarSettings()
                                                                .addSettingsInputRow({
                                                                    id: nanoid(),
                                                                    parentId: 'cardfontStylePnl',
                                                                    inline: true,
                                                                    propertyName: 'card.font',
                                                                    inputs: [
                                                                        {
                                                                            type: 'dropdown',
                                                                            id: nanoid(),
                                                                            label: 'Family',
                                                                            propertyName: 'card.font.type',
                                                                            hideLabel: true,
                                                                            defaultValue: 'Arial',
                                                                            dropdownOptions: fontTypes,
                                                                        },
                                                                        {
                                                                            type: 'numberField',
                                                                            id: nanoid(),
                                                                            label: 'Size',
                                                                            propertyName: 'card.font.size',
                                                                            hideLabel: true,
                                                                            defaultValue: 14,
                                                                            width: 50,
                                                                        },
                                                                        {
                                                                            type: 'dropdown',
                                                                            id: nanoid(),
                                                                            label: 'Weight',
                                                                            propertyName: 'card.font.weight',
                                                                            hideLabel: true,
                                                                            defaultValue: 400,
                                                                            tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                                                            dropdownOptions: fontWeights,
                                                                            width: 100,
                                                                        },
                                                                        {
                                                                            type: 'colorPicker',
                                                                            id: nanoid(),
                                                                            label: 'Color',
                                                                            hideLabel: true,
                                                                            propertyName: 'card.font.color',
                                                                        }
                                                                    ],
                                                                })
                                                                .toJson()
                                                            ]
                                                        }
                                                    })
                                                    .addCollapsiblePanel({
                                                        id: nanoid(),
                                                        propertyName: 'card.pnlDimension',
                                                        label: 'Dimension',
                                                        labelAlign: 'right',
                                                        ghost: true,
                                                        parentId: nanoid(),
                                                        collapsible: 'header',
                                                        content: {
                                                            id: nanoid(),
                                                            components: [...new DesignerToolbarSettings()
                                                                .addSettingsInputRow({
                                                                    id: nanoid(),
                                                                    parentId: 'card-width-dimensions-style-pnl',
                                                                    inline: true,
                                                                    inputs: [
                                                                        {
                                                                            type: 'textField',
                                                                            id: nanoid(),
                                                                            label: "Width",
                                                                            width: 85,
                                                                            propertyName: "card.dimensions.width",
                                                                            icon: "widthIcon",
                                                                            tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                                        },
                                                                        {
                                                                            type: 'textField',
                                                                            id: nanoid(),
                                                                            label: "Min Width",
                                                                            width: 85,
                                                                            hideLabel: true,
                                                                            propertyName: "card.dimensions.minWidth",
                                                                        },
                                                                        {
                                                                            type: 'textField',
                                                                            id: nanoid(),
                                                                            label: "Max Width",
                                                                            width: 85,
                                                                            hideLabel: true,
                                                                            propertyName: "card.dimensions.maxWidth",
                                                                        }
                                                                    ]
                                                                })
                                                                .addSettingsInputRow({
                                                                    id: nanoid(),
                                                                    parentId: 'card-height-dimensions-style-pnl',
                                                                    inline: true,
                                                                    inputs: [
                                                                        {
                                                                            type: 'textField',
                                                                            id: nanoid(),
                                                                            label: "Height",
                                                                            width: 85,
                                                                            propertyName: "card.dimensions.height",
                                                                            icon: "heightIcon",
                                                                            tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                                        },
                                                                        {
                                                                            type: 'textField',
                                                                            id: nanoid(),
                                                                            label: "Min Height",
                                                                            width: 85,
                                                                            hideLabel: true,
                                                                            propertyName: "card.dimensions.minHeight",
                                                                        },
                                                                        {
                                                                            type: 'textField',
                                                                            id: nanoid(),
                                                                            label: "Max Height",
                                                                            width: 85,
                                                                            hideLabel: true,
                                                                            propertyName: "card.dimensions.maxHeight",
                                                                        }
                                                                    ]
                                                                })
                                                                .toJson()
                                                            ]
                                                        }
                                                    })
                                                    .addCollapsiblePanel({
                                                        id: nanoid(),
                                                        propertyName: 'card.pnlBackgroundStyle',
                                                        label: 'Background',
                                                        labelAlign: 'right',
                                                        ghost: true,
                                                        parentId: nanoid(),
                                                        collapsible: 'header',
                                                        content: {
                                                            id: nanoid(),
                                                            components: [
                                                                ...new DesignerToolbarSettings()
                                                                    .addSettingsInput({
                                                                        id: nanoid(),
                                                                        parentId: "backgroundStylePnl",
                                                                        label: "Type",
                                                                        jsSetting: false,
                                                                        propertyName: "card.background.type",
                                                                        inputType: "radio",
                                                                        defaultValue: "color",
                                                                        tooltip: "Select a type of background",
                                                                        buttonGroupOptions: backgroundTypeOptions,
                                                                    })
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: "backgroundStylePnl",
                                                                        inputs: [{
                                                                            type: 'colorPicker',
                                                                            id: nanoid(),
                                                                            label: "Color",
                                                                            defaultValue: 'rgba(0,0,0,0.02)',
                                                                            propertyName: "card.background.color",
                                                                            hideLabel: true,
                                                                            jsSetting: false,
                                                                        }],
                                                                        hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.card?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                                    })
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: "backgroundStylePnl",
                                                                        inputs: [{
                                                                            type: 'multiColorPicker',
                                                                            id: nanoid(),
                                                                            propertyName: "card.background.gradient.colors",
                                                                            label: "Colors",
                                                                            jsSetting: false,
                                                                        }
                                                                        ],
                                                                        hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.card?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                                        hideLabel: true,
                                                                    })
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: "backgroundStylePnl",
                                                                        inputs: [{
                                                                            type: 'textField',
                                                                            id: nanoid(),
                                                                            propertyName: "card.background.url",
                                                                            jsSetting: false,
                                                                            label: "URL",
                                                                        }],
                                                                        hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.card?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                                    })
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: 'backgroundStylePnl',
                                                                        inputs: [{
                                                                            type: 'imageUploader',
                                                                            id: nanoid(),
                                                                            propertyName: 'card.background.uploadFile',
                                                                            label: "Image",
                                                                            jsSetting: false,
                                                                        }],
                                                                        hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.card?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                                    })
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: 'backgroundStylePnl',
                                                                        hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.card?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                                        inputs: [
                                                                            {
                                                                                type: 'textField',
                                                                                id: nanoid(),
                                                                                jsSetting: false,
                                                                                propertyName: "card.background.storedFile.id",
                                                                                label: "File ID"
                                                                            }
                                                                        ]
                                                                    })
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: 'backgroundStyleRow',
                                                                        inline: true,
                                                                        hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.card?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                                        inputs: [
                                                                            {
                                                                                type: 'customDropdown',
                                                                                id: nanoid(),
                                                                                label: "Size",
                                                                                defaultValue: 'cover',
                                                                                hideLabel: true,
                                                                                propertyName: "card.background.size",
                                                                                dropdownOptions: sizeOptions,
                                                                            },
                                                                            {
                                                                                type: 'customDropdown',
                                                                                id: nanoid(),
                                                                                label: "Position",
                                                                                hideLabel: true,
                                                                                defaultValue: 'center',
                                                                                propertyName: "card.background.position",
                                                                                dropdownOptions: positionOptions,
                                                                            }
                                                                        ]
                                                                    })
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: 'backgroundStyleRow',
                                                                        inputs: [
                                                                            {
                                                                                type: 'radio',
                                                                                id: nanoid(),
                                                                                parentId: 'backgroundStyleRow',
                                                                                label: 'Repeat',
                                                                                hideLabel: true,
                                                                                propertyName: 'card.background.repeat',
                                                                                buttonGroupOptions: repeatOptions,
                                                                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.card?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                                            }]
                                                                    })
                                                                    .toJson()
                                                            ],
                                                        }
                                                    })
                                                    .addCollapsiblePanel({
                                                        id: nanoid(),
                                                        propertyName: 'card.customStyle',
                                                        label: 'Custom Styles',
                                                        labelAlign: 'right',
                                                        ghost: true,
                                                        parentId: nanoid(),
                                                        collapsible: 'header',
                                                        content: {
                                                            id: nanoid(),
                                                            components: [...new DesignerToolbarSettings()
                                                                .addSettingsInput({
                                                                    id: nanoid(),
                                                                    inputType: 'codeEditor',
                                                                    propertyName: 'card.style',
                                                                    hideLabel: false,
                                                                    label: 'Style',
                                                                    description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                                })
                                                                .toJson()
                                                            ]
                                                        }
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .toJson()]
                            }).toJson()]
                    },
                    {
                        key: '3',
                        title: 'Security',
                        id: securityTabId,
                        type: '',
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