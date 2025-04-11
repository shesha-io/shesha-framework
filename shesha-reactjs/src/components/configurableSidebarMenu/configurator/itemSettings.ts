import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getItemSettings = (data: any) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
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
                        key: 'common',
                        title: 'Common',
                        id: commonTabId,
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    id: nanoid(),
                                    inputType: "dropdown",
                                    propertyName: "itemType",
                                    parentId: commonTabId,
                                    label: "Item Type",
                                    size: "small",
                                    dropdownOptions: [
                                        {
                                            label: "Button",
                                            value: "button"
                                        },
                                        {
                                            label: "Divider",
                                            value: "divider"
                                        }
                                    ],
                                    validate: {
                                        required: true
                                    },
                                    jsSetting: true,
                                })
                                .addSettingsInput({
                                    id: nanoid(),
                                    inputType: "textField",
                                    propertyName: "title",
                                    parentId: commonTabId,
                                    label: "Title",
                                    jsSetting: true,
                                    validate: {
                                        required: true
                                    },
                                })
                                .addContainer({
                                    id: nanoid(),
                                    parentId: commonTabId,
                                    propertyName: "cntButton",
                                    label: "Container2",
                                    hidden: {
                                        _code: "return getSettingValue(data?.itemType) !== 'button';",
                                        _mode: "code",
                                        _value: false
                                    },
                                    justifyContent: "left",
                                    direction: "vertical",
                                    components: [
                                        ...new DesignerToolbarSettings()
                                            .addSettingsInput({
                                                id: nanoid(),
                                                inputType: "textArea",
                                                propertyName: "tooltip",
                                                parentId: commonTabId,
                                                label: "Tooltip",
                                                jsSetting: true,
                                            })
                                            .addSettingsInput({
                                                id: nanoid(),
                                                inputType: "iconPicker",
                                                propertyName: "icon",
                                                parentId: commonTabId,
                                                label: "Icon",
                                                jsSetting: true,
                                            })
                                            .addConfigurableActionConfigurator({
                                                id: nanoid(),
                                                propertyName: "actionConfiguration",
                                                parentId: commonTabId,
                                                label: "Action",
                                                allowedActions: ["shesha.common"],
                                                jsSetting: false
                                            })
                                            .toJson()
                                    ]
                                })
                                .addSettingsInput({
                                    id: nanoid(),
                                    inputType: "switch",
                                    propertyName: "hidden",
                                    parentId: commonTabId,
                                    label: "Hide",
                                    jsSetting: true,
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
                                propertyName: 'requiredPermissions',
                                label: 'Permissions',
                                size: 'small',
                                parentId: securityTabId,
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    }
                ]
            })
            .toJson(),
        formSettings: {
            colon: false,
            layout: 'horizontal' as FormLayout,
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
            isSettingsForm: true
        }
    };
};