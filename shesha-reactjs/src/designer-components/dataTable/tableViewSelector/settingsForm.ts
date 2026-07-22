import { SettingsFormMarkupFactory } from '@/interfaces';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  return {
    components: fbf()
      .addSearchableTabs({
        id: 'W_m7doMyCpCYwAYDfRh6I',
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
            id: 's4gmBg31azZC0UjZjpfTm',
            components: [
              ...fbf()
                .addCollapsiblePanel({
                  id: 'collapsiblePanel1',
                  propertyName: 'commonSettings',
                  label: 'Filters',
                  labelAlign: 'right',
                  parentId: 'W_m7doMyCpCYwAYDfRh6I',
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: 'fontStylePnl',
                    components: [
                      ...fbf()
                        .addSettingsInput({
                          inputType: 'filtersList',
                          id: 's4gmBg31azZC0UjZjpfTm',
                          propertyName: 'filters',
                          hideLabel: true,
                          label: 'Filters',
                          layout: 'horizontal',
                        })
                        .toJson(),
                    ],
                  },
                })
                .addSettingsInput({
                  inputType: 'switch',
                  id: 'hidden-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'hidden',
                  label: 'Hide',
                  jsSetting: true,
                  layout: 'horizontal',
                })
                .addSettingsInput({
                  inputType: 'switch',
                  id: 'showIcon-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'showIcon',
                  label: 'Show Icon',
                  description: 'Display the layout icon next to the View label',
                  layout: 'horizontal',
                })
                .toJson(),
            ],
          },
          {
            key: '5',
            title: 'Security',
            id: '6Vw9iiDw9d0MD_Rh5cbIn',
            components: [
              ...fbf()
                .addSettingsInput({
                  id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  jsSetting: true,
                  size: 'small',
                  parentId: '6Vw9iiDw9d0MD_Rh5cbIn',
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
