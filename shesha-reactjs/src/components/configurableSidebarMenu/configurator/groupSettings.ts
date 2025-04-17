import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getGroupSettings = (data: any) => {
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
                                    inputType: "textField",
                                    propertyName: "title",
                                    parentId: commonTabId,
                                    label: "Title",
                                    jsSetting: true,
                                    validate: {
                                        required: true
                                    },
                                })
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
            labelCol: { span: 8},
            wrapperCol: { span: 16 },
            isSettingsForm: true
        }
    };
};