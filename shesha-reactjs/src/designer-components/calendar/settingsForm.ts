import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/es/form/Form';
import { getSettings as getCalendarLayersSettings } from './calendarLayersSettings';

export const getSettings = (data: any) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const dataTabId = nanoid();
    const eventsTabId = nanoid();
    const appearanceTabId = nanoid();
    const styleRouterId = nanoid();
    const securityTabId = nanoid();

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
                        components: [
                            ...new DesignerToolbarSettings()
                                .addContextPropertyAutocomplete({
                                    id: nanoid(),
                                    propertyName: 'name',
                                    label: 'Name',
                                    styledLabel: true,
                                    parentId: commonTabId,
                                    size: 'small',
                                    validate: {
                                        required: true,
                                    },
                                    jsSetting: false,
                                })
                                .addSettingsInput({
                                    inputType: 'dropdown',
                                    id: nanoid(),
                                    parentId: commonTabId,
                                    propertyName: 'displayPeriod',
                                    label: 'Default Display Period',
                                    dropdownMode: 'multiple',
                                    dropdownOptions: [
                                        { label: 'Month', value: 'month' },
                                        { label: 'Week', value: 'week' },
                                        { label: 'Work Week', value: 'work_week' },
                                        { label: 'Day', value: 'day' },
                                        { label: 'Agenda', value: 'agenda' }
                                    ]
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: commonTabId,
                                    inputs: [
                                        {
                                            type: 'date',
                                            id: nanoid(),
                                            propertyName: 'minDate',
                                            label: 'Min Date',
                                            tooltip: 'Min Date',
                                        },
                                        {
                                            type: 'date',
                                            id: nanoid(),
                                            propertyName: 'maxDate',
                                            label: 'Max Date',
                                            tooltip: 'Max Date',
                                        }
                                    ]
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: commonTabId,
                                    inputs: [
                                        {
                                            type: 'codeEditor',
                                            id: nanoid(),
                                            propertyName: 'externalStartDate',
                                            label: 'External Start Date',
                                            description: 'Use javascript to set the start date to reflect on the calendar',
                                            language: 'javascript',
                                            wrapInTemplate: true,
                                        },
                                        {
                                            type: 'codeEditor',
                                            id: nanoid(),
                                            propertyName: 'externalEndDate',
                                            label: 'External End Date',
                                            description: 'Use javascript to set the end date to reflect on the calendar',
                                            language: 'javascript',
                                            wrapInTemplate: true,
                                        }
                                    ]
                                })
                                .toJson(),
                        ],
                    },
                    {
                        key: '2',
                        title: 'Data',
                        id: dataTabId,
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    inputType: 'layerSelectorSettingsModal',
                                    id: nanoid(),
                                    parentId: dataTabId,
                                    propertyName: 'items',
                                    label: 'Layer Selector Settings Modal',
                                    hideLabel: true,
                                    settings: getCalendarLayersSettings(),
                                })
                                .addSettingsInput({
                                    inputType: 'textField',
                                    id: nanoid(),
                                    parentId: dataTabId,
                                    propertyName: 'momentLocale',
                                    label: 'Moment Locale',
                                    tooltip: 'Sets the locale of the calendar using moment.js locales (e.g. en, en-gb, fr, de, etc.)',
                                })
                                .toJson(),
                        ],
                    },
                    {
                        key: '3',
                        title: 'Events',
                        id: eventsTabId,
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    inputType: 'configurableActionConfigurator',
                                    id: nanoid(),
                                    parentId: eventsTabId,
                                    propertyName: 'onSlotClick',
                                    label: 'On Slot Click',
                                    editorConfig: null,
                                    level: 1,
                                    hideLabel: true,
                                })
                                .addSettingsInput({
                                    inputType: 'configurableActionConfigurator',
                                    id: nanoid(),
                                    parentId: eventsTabId,
                                    propertyName: 'onViewChange',
                                    label: 'On View Change',
                                    editorConfig: null,
                                    level: 1,
                                    hideLabel: true,
                                })
                                .toJson()
                        ]
                    },
                    {
                        key: '4',
                        title: 'Appearance',
                        id: appearanceTabId,
                        components: [
                            ...new DesignerToolbarSettings()
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

                                            .addSettingsInputRow({
                                                id: nanoid(),
                                                parentId: styleRouterId,
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
                                                parentId: styleRouterId,
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
                                            .addCollapsiblePanel({
                                                id: nanoid(),
                                                propertyName: 'stylingBox',
                                                label: 'Margin & Padding',
                                                labelAlign: 'right',
                                                ghost: true,
                                                collapsible: 'header',
                                                content: {
                                                    id: nanoid(),
                                                    components: [
                                                        ...new DesignerToolbarSettings()
                                                            .addStyleBox({
                                                                id: nanoid(),
                                                                label: 'Margin Padding',
                                                                hideLabel: true,
                                                                propertyName: 'stylingBox',
                                                            })
                                                            .toJson(),
                                                    ],
                                                },
                                            })
                                            .addSettingsInput({
                                                inputType: 'colorPicker',
                                                id: nanoid(),
                                                propertyName: 'dummyEventColor',
                                                label: 'Selected Date Color',
                                                parentId: styleRouterId,
                                            })
                                            .toJson()
                                    ]
                                })
                                .toJson()
                        ]
                    },
                    {
                        key: '5',
                        title: 'Security',
                        id: securityTabId,
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    id: nanoid(),
                                    inputType: 'permissions',
                                    propertyName: 'permissions',
                                    label: 'Permissions',
                                    size: 'small',
                                    parentId: securityTabId,
                                    jsSetting: false,
                                    tooltip: 'Enter a list of permissions that should be associated with this component',
                                })
                                .toJson(),
                        ],
                    },
                ],
            })
            .toJson(),
        formSettings: {
            colon: false,
            layout: 'vertical' as FormLayout,
            labelCol: { span: 24 },
            wrapperCol: { span: 24 },
        },
    };
};