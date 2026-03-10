import { SettingsFormMarkupFactory } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const securityId = nanoid();

  const propertyNameId = nanoid();
  const hiddenId = nanoid();

  return {
    components: fbf()
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
            components: [...fbf()
              .addContextPropertyAutocomplete({
                id: propertyNameId,
                propertyName: "propertyName",
                parentId: commonTabId,
                label: "Property Name",
                size: "small",
                validate: {
                  required: true,
                },
                styledLabel: true,
                jsSetting: true,
              })
              .addSettingsInput({
                id: hiddenId,
                propertyName: 'hidden',
                label: 'Hide',
                parentId: commonTabId,
                inputType: 'switch',
                jsSetting: true,
              })
              .toJson(),
            ],
          },
          {
            key: 'security',
            title: 'Security',
            id: securityId,
            components: [...fbf()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                jsSetting: true,
                size: 'small',
                parentId: securityId,
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
