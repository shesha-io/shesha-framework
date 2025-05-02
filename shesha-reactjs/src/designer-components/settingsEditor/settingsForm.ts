import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();

  return {
    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        size: 'small',
        tabs: [
          {
            key: 'common',
            title: 'Common',
            id: commonTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  label: 'Property name',
                  styledLabel: true,
                  parentId: commonTabId,
                  validate: { required: true },
                  jsSetting: true,
                  size: 'small',
                })
                .addSettingsInput({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputType: 'textArea',
                  propertyName: 'description',
                  label: 'Tooltip',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'editModeSelector',
                      id: nanoid(),
                      propertyName: 'editMode',
                      label: 'Edit Mode',
                      size: 'small',
                      defaultValue: 'inherited',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
                      size: 'small',
                      jsSetting: true,
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'numberField',
                      id: nanoid(),
                      propertyName: 'height',
                      label: 'Height',
                      tooltip: 'Enter height of component.',
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: true,
      layout: 'horizontal' as FormLayout,
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      displayName: 'DEFAULT_FORM_SETTINGS',
      __docgenInfo: {
        description: 'Default form settings',
        displayName: 'DEFAULT_FORM_SETTINGS',
        props: {},
      },
    },
  };
};
