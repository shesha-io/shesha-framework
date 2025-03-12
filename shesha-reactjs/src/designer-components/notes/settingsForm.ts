import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const displayTabId = nanoid();
  const stylingTabId = nanoid();
  const notesTabId = nanoid();
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
            id: displayTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: displayTabId,
                  readOnly: false,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'componentName',
                      label: 'Component name',
                      jsSetting: false,

                      validate: {
                        required: true
                      }
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: displayTabId,
                  readOnly: false,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'label',
                      label: 'Label'
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: displayTabId,
                  readOnly: false,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'hide'
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'allowDelete',
                      label: 'Allow Delete'
                    }
                  ]
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'editModeSelector',
                  propertyName: 'editMode',
                  label: 'Edit mode',
                  parentId: displayTabId,
                })
                .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: stylingTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: stylingTabId,
                  readOnly: false,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: nanoid(),
                      propertyName: 'savePlacement',
                      label: 'Save Placement',
                      description: 'This used to place the save button (Left, Right).',
                      defaultValue: 'left',
                      dropdownOptions: [
                        { value: 'left', label: 'Left' },
                        { value: 'right', label: 'Right' }
                      ]
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: stylingTabId,
                  readOnly: false,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'autoSize',
                      label: 'Auto Size'
                    }
                  ]
                })
                .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: notesTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: notesTabId,
                  readOnly: false,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'ownerId',
                      label: 'Owner Id'
                    },
                    {
                      id: 'c6ecd70c-7419-4ea7-a715-d42699d26e6e',
                      propertyName: 'ownerType',
                      type: 'autocomplete',
                      parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
                      label: 'Owner Type',
                      labelAlign: 'right',
                      dataSourceType: 'url',
                      dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                      mode: 'single',
                    }
                  ]
                })
                .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  parentId: securityTabId,
                  validate: {}
                })
                .toJson()
            ]
          }
        ]
      })
      .toJson(),
    formSettings: {
      layout: 'vertical' as FormLayout,
      colon: false,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};