import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getItemSettings = () => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const securityTabId = nanoid();

    return new DesignerToolbarSettings()
        .addSearchableTabs({
            id: searchableTabsId,
            propertyName: 'settingsTabs',
            parentId: 'root',
            label: 'Settings',
            hideLabel: true,
            labelAlign: 'right',
            ghost: true,
            size: 'small',
            tabs: [
                {
                    key: '1',
                    title: 'Common',
                    id: commonTabId,
                    type: '',
                    components: [
                        ...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                                id: nanoid(),
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'textField',
                                        propertyName: 'name',
                                        label: 'Name',
                                        labelAlign: 'right',
                                        jsSetting: false,
                                        parentId: 'root'
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'textField',
                                        propertyName: 'title',
                                        label: 'Title',
                                        labelAlign: 'right',
                                        parentId: 'root',
                                        jsSetting: true
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'textField',
                                        propertyName: 'key',
                                        label: 'Key',
                                        jsSetting: false,
                                        labelAlign: 'right',
                                        parentId: 'root'
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'textField',
                                        propertyName: 'className',
                                        label: 'Class Name',
                                        labelAlign: 'right',
                                        parentId: 'root',
                                        jsSetting: true
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'animated',
                                        label: 'Animated',
                                        labelAlign: 'right',
                                        parentId: 'root',
                                        hidden: false,
                                        jsSetting: true,
                                        validate: {}
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'iconPicker',
                                        propertyName: 'icon',
                                        label: 'Icon',
                                        jsSetting: true,
                                        labelAlign: 'right',
                                        parentId: 'root',
                                        hidden: false
                                    }
                                ]
                            })

                            .addSettingsInputRow({
                                id: nanoid(),
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'forceRender',
                                        label: 'Force Render',
                                        labelAlign: 'right',
                                        parentId: 'root',
                                        hidden: false,
                                        validate: {},
                                        jsSetting: true
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        labelAlign: 'right',
                                        parentId: 'root',
                                        hidden: false,
                                        validate: {},
                                        jsSetting: true
                                    },
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'editModeSelector',
                                        propertyName: 'editMode',
                                        parentId: 'root',
                                        label: 'Edit Mode',
                                        jsSetting: true
                                    },
                                    {
                                        id: nanoid(),
                                        type: "dropdown",
                                        propertyName: "selectMode",
                                        parentId: "root",
                                        label: "Select Mode",
                                        allowClear: false,
                                        jsSetting: true,
                                        defaultValue: "editable",
                                        dropdownOptions: [
                                            {
                                                label: "Selectable",
                                                value: "editable"
                                            },
                                            {
                                                label: "Disabled",
                                                value: "readOnly"
                                            },
                                            {
                                                label: "Inherited from Edit mode",
                                                value: "inherited"
                                            }
                                        ],
                                    },

                                ]
                            })

                            .addSettingsInput(
                                {
                                    id: nanoid(),
                                    inputType: 'switch',
                                    propertyName: 'destroyInactiveTabPane',
                                    label: 'Destroy Inactive Tab Pane',
                                    labelAlign: 'right',
                                    parentId: 'root',
                                    hidden: false,
                                    validate: {},
                                    jsSetting: true
                                }
                            )
                            .toJson()
                    ]
                },
                {
                    key: '2',
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
                            jsSetting: true,
                            parentId: securityTabId
                        })
                        .toJson()
                    ]
                }
            ]
        }).toJson();
};