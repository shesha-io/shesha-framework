import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/es/form/Form';
import { nanoid } from 'nanoid';

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
                                    inputType: 'calendarSelectorSettingsModal',
                                    id: nanoid(),
                                    parentId: dataTabId,
                                    propertyName: 'items',
                                    label: 'Calendar Selector Settings Modal',
                                    hideLabel: true,
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: dataTabId,
                                    inputs: [
                                        {
                                            type: 'date',
                                            id: nanoid(),
                                            parentId: dataTabId,
                                            propertyName: 'minDate',
                                            label: 'Min Date',
                                            tooltip: 'Min Date',
                                        },
                                        {
                                        type: 'date',
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        propertyName: 'maxDate',
                                        label: 'Max Date',
                                        tooltip: 'Max Date',
                                    }
                                    ]
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: dataTabId,
                                    inputs: [
                                        {
                                            type: 'codeEditor',
                                            id: nanoid(),
                                            propertyName: 'externalStartDate',
                                            label: 'External Start Date',
                                            description: 'Use javascript to set the start date to reflect on the calendar',
                                            language: 'javascript',
                                            wrapInTemplate: true,
                                            exposedVariables: [
                                                {
                                                    id: nanoid(),
                                                    name: 'data',
                                                    description: 'Form data',
                                                    type: 'object',
                                                },
                                                {
                                                    id: nanoid(),
                                                    name: 'globalState',
                                                    description: 'The global state',
                                                    type: 'object',
                                                },
                                            ]
                                        },
                                        {
                                            type: 'codeEditor',
                                            id: nanoid(),
                                            propertyName: 'externalEndDate',
                                            label: 'External End Date',
                                            description: 'Use javascript to set the end date to reflect on the calendar',
                                            language: 'javascript',
                                            wrapInTemplate: true,
                                            exposedVariables: [
                                                {
                                                    id: nanoid(),
                                                    name: 'data',
                                                    description: 'Form data',
                                                    type: 'object',
                                                },
                                                {
                                                    id: nanoid(),
                                                    name: 'globalState',
                                                    description: 'The global state',
                                                    type: 'object',
                                                },
                                            ]
                                        }

                                    ]

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
                                    inputType: 'codeEditor',
                                    propertyName: 'customVisibility',
                                    label: 'Custom Visibility',
                                    size: 'small',
                                    parentId: securityTabId,
                                    jsSetting: true,

                                    tooltip:
                                        'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
                                })
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