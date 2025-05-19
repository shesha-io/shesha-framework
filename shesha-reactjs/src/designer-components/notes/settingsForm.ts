import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
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
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'componentName',
                      label: 'Component Name',
                      jsSetting: false,
                      validate: {
                        required: true
                      }
                    }
                  ]
                })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: commonTabId,
  
                      inputs: [
                        {
                          type: 'switch',
                          id: nanoid(),
                          propertyName: 'autoSize',
                          label: 'Auto Size',
                          jsSetting: true
                        },
                        {
                          type: 'switch',
                          id: nanoid(),
                          propertyName: 'allowDelete',
                          label: 'Allow Delete',
                          jsSetting: true
                        }
                      ]
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
                          parentId: commonTabId,
                          defaultValue: 'inherited',
                          jsSetting: true,
                        },
                        {
                          type: 'switch',
                          id: nanoid(),
                          propertyName: 'hidden',
                          label: 'Hide',
                          jsSetting: true
                        }
                      ]
                    })
                .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'ownerId',
                      label: 'Owner ID',
                      jsSetting: true
                    },
                    {
                      id: nanoid(),
                      propertyName: 'ownerType',
                      type: 'autocomplete',
                      parentId: nanoid(),
                      label: 'Owner Type',
                      labelAlign: 'right',
                      dataSourceType: 'url',
                      dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                      mode: 'single',
                      jsSetting: true
                    } 
                  ]
                })
                .toJson()
            ]
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: eventsTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'codeEditor',
                      propertyName: 'onCreated',
                      label: 'On Created',
                      labelAlign: 'right',
                      parentId: eventsTabId,
                      tooltip: 'Triggered after successfully creating a new note (access notes using createdNotes array)',  
                      exposedVariables: [` { name: 'createdNotes', description: 'Created note', type: 'array' },`]
                    }
                  ]
                })
                .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: appearanceTabId,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: nanoid(),
                      propertyName: 'savePlacement',
                      label: 'Buttons Layout',
                      tooltip: 'This is used to place the save button (Left, Right).',
                      defaultValue: 'left',
                      jsSetting: true,
                      dropdownOptions: [
                        { value: 'left', label: 'Left' },
                        { value: 'right', label: 'Right' }
                      ]
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
                  validate: {},
                  jsSetting: true
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