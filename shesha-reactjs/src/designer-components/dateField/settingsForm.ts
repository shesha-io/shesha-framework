import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs } from '../_settings/utils/border/utils';
import { getCornerInputs } from '../_settings/utils/border/utils';
import { IDateFieldProps } from './interfaces';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: IDateFieldProps) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const formatsTabId = nanoid();
    const controlVisibilityTabId = nanoid();
    const eventsTabId = nanoid();
    const validationTabId = nanoid();
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
                                styledLabel: true,
                                size: 'small',
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
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        propertyName: 'picker',
                                        label: 'Picker',
                                        type: 'dropdown',
                                        size: 'small',
                                        jsSetting: true,
                                        dropdownOptions: [
                                            {
                                                value: "date",
                                                label: "date"
                                            },
                                            {
                                                value: "week",
                                                label: "week"
                                            },
                                            {
                                                value: "month",
                                                label: "month"
                                            },
                                            {
                                                value: "quarter",
                                                label: "quarter"
                                            },
                                            {
                                                value: "year",
                                                label: "year"
                                            }
                                        ]
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'range',
                                        label: 'Range?',
                                        jsSetting: true,
                                    },
                                ],
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputType: 'switch',
                                propertyName: 'resolveToUTC',
                                label: 'Resolve to UTC',
                                jsSetting: true,
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        propertyName: 'placeholder',
                                        label: 'Placeholder',
                                        type: 'textField',
                                        size: 'small',
                                        jsSetting: true,
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'textArea',
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
                                        id: nanoid(),
                                        type: 'editModeSelector',
                                        propertyName: 'editMode',
                                        label: 'Edit Mode',
                                        size: 'small',
                                        jsSetting: true,
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                        layout: 'horizontal',
                                    },
                                ],
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Formats',
                        id: formatsTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'dateFormat',
                                label: 'Date Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "DD/MM/YYYY",
                                parentId: formatsTabId
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'timeFormat',
                                label: 'Time Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "HH:mm:ss",
                                parentId: formatsTabId
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'yearFormat',
                                label: 'Year Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "YYYY",
                                parentId: formatsTabId
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'quarterFormat',
                                label: 'Quarter Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "YYYY-\\QQ",
                                parentId: formatsTabId
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'monthFormat',
                                label: 'Month Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "YYYY-MM",
                                parentId: formatsTabId
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'weekFormat',
                                label: 'Week Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "YYYY-wo",
                                parentId: formatsTabId
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '3',
                        title: 'Control Visibility',
                        id: controlVisibilityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'showTime',
                                label: 'Show Time',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: controlVisibilityTabId
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'defaultToMidnight',
                                label: 'Default time to midnight',
                                size: 'small',
                                layout: 'horizontal',
                                defaultValue: true,
                                jsSetting: true,
                                parentId: controlVisibilityTabId,
                                hidden: { _code: 'return  !getSettingValue(data?.showTime);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'showNow',
                                label: 'Show Today/Now',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: controlVisibilityTabId
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'dropdown',
                                propertyName: 'disabledDateMode',
                                label: 'Disabled date mode',
                                parentId: controlVisibilityTabId,
                                dropdownOptions: [
                                    { value: 'none', label: 'None' },
                                    { value: 'functionTemplate', label: 'Function template' },
                                    { value: 'customFunction', label: 'Custom function' },
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'dropdown',
                                propertyName: 'disabledDateTemplate',
                                label: 'Disabled date templates',
                                parentId: controlVisibilityTabId,
                                hidden: { _code: "return  getSettingValue(data.disabledDateMode) !== 'functionTemplate'", _mode: 'code', _value: false } as any,
                                dropdownOptions: [
                                    { value: "return current && current < moment().startOf('day');", label: 'Disable past dates' },
                                    { value: "return current && current > moment().endOf('day');", label: 'Disable future dates' }
                                ]
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'dropdown',
                                propertyName: 'disabledTimeMode',
                                label: 'Disabled time mode',
                                parentId: controlVisibilityTabId,
                                defaultValue: 'none',
                                dropdownOptions: [
                                    { value: 'none', label: 'None' },
                                    { value: 'timeFunctionTemplate', label: 'Function template' },
                                    { value: 'customTimeFunction', label: 'Custom function' },
                                ],
                                hidden: {
                                    _code: 'return  !getSettingValue(data?.showTime);',
                                    _mode: 'code',
                                    _value: false
                                }
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'dropdown',
                                propertyName: 'disabledTimeTemplate',
                                label: 'Disabled time templates',
                                parentId: controlVisibilityTabId,
                                hidden: {
                                    _code: "return  getSettingValue(data.disabledTimeMode) !== 'timeFunctionTemplate';",
                                    _mode: 'code',
                                    _value: false
                                } as any,
                                dropdownOptions: [
                                    { value: "disabledPastTime", label: 'Disable past times' },
                                    { value: "disabledFutureTime", label: 'Disable future times' }
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '4',
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
                    {
                        key: '5',
                        title: 'Validation',
                        id: validationTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'validate.required',
                                label: 'Required',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: validationTabId
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '6',
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
                                                        parentId: nanoid(),
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
                                                            },
                                                            {
                                                                type: 'dropdown',
                                                                id: nanoid(),
                                                                label: 'Align',
                                                                propertyName: 'font.align',
                                                                hideLabel: true,
                                                                width: 60,
                                                                dropdownOptions: textAlign,
                                                            },
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
                                                        parentId: nanoid(),
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
                                                        parentId: nanoid(),
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
                                                        parentId: nanoid(),
                                                        components: getBorderInputs() as any
                                                    })
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: nanoid(),
                                                        components: getCornerInputs() as any
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
                                            content: {
                                                id: nanoid(),
                                                components: [
                                                    ...new DesignerToolbarSettings()
                                                        .addSettingsInput({
                                                            id: nanoid(),
                                                            parentId: nanoid(),
                                                            label: "Type",
                                                            jsSetting: false,
                                                            propertyName: "background.type",
                                                            inputType: "radio",
                                                            tooltip: "Select a type of background",
                                                            buttonGroupOptions: backgroundTypeOptions,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                            inline: true,
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
                                                                    dropdownOptions: positionOptions,
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: nanoid(),
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
                                                        parentId: nanoid(),
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
                                                        hideLabel: true,
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
                        key: '7',
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