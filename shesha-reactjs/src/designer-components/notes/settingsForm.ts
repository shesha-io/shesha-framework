import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  return {
    components: fbf('root')
      .addSearchableTabs({
        id: searchableTabsId, propertyName: 'settingsTabs', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          {
            key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
              .stdVisibleEditableInputs('full')
              .stdCollapsiblePanel('Owner', (fb) => fb
                .addSettingsInput({ inputType: 'entityTypeAutocomplete', propertyName: 'ownerType', label: 'Owner Type', labelAlign: 'right', jsSetting: true, validate: { required: true } })
                .addSettingsInput({ inputType: 'textField', propertyName: 'ownerId', label: 'Owner ID', jsSetting: true, validate: { required: true } })
                .addSettingsInput({ inputType: 'textField', propertyName: 'category', label: 'Notes Category', tooltip: 'This is used to group notes into categories', jsSetting: true }))
              .stdCollapsiblePanel('Behaviour', (fb) => fb
                .addSettingsInputRow({
                  inputs: [
                    { type: 'switch', propertyName: 'allowEdit', label: 'Allow Edit', jsSetting: true, tooltip: 'Allows existing notes to be edited' },
                    { type: 'switch', propertyName: 'allowDelete', label: 'Allow Delete', jsSetting: true, tooltip: 'Allows existing notes to be deleted' },
                  ],
                })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'switch', propertyName: 'autoSize', label: 'Auto Size', jsSetting: true, tooltip: 'Grows the editor as the note is typed' },
                    { type: 'switch', propertyName: 'showCharCount', label: 'Show Chars Count', jsSetting: true },
                  ],
                }))
              .stdCollapsiblePanel('Validations', (fb) => fb
                .addSettingsInputRow({
                  inputs: [
                    { type: 'numberField', propertyName: 'minLength', label: 'Min Length', min: 0, size: 'small', jsSetting: true, tooltip: 'Shortest note that can be posted, leave empty for no limit' },
                    { type: 'numberField', propertyName: 'maxLength', label: 'Max Length', min: 0, size: 'small', jsSetting: true, tooltip: 'Longest note that can be posted, leave empty for no limit' },
                  ],
                }))
              .toJson(),
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: fbf(eventsTabId)
              .stdEventHandler('onCreateAction', 'On Create', 'Triggered after successfully creating a new note (access notes using createdNotes array)', 'return metadataBuilder.object("constants")\r\n.addAllStandard()\r\n.addArray("createdNotes", "Notes that were created")\r\n.build();')
              .stdEventHandler('onUpdateAction', 'On Update', 'Triggered after successfully updating a note (access the note using the note object)', 'return metadataBuilder.object("constants")\r\n.addAllStandard()\r\n.addObject("note", "The note that was updated", undefined)\r\n.build();')
              .stdEventHandler('onDeleteAction', 'On Delete', 'Triggered after successfully deleting a note (access the note using the note object)', 'return metadataBuilder.object("constants")\r\n.addAllStandard()\r\n.addObject("note", "The note that was deleted", undefined)\r\n.build();')
              .stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'])
              .toJson(),
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addSettingsInput({
                inputType: 'dropdown', propertyName: 'savePlacement', label: 'Buttons Layout', jsSetting: true,
                tooltip: 'This is used to place the save button (Left, Right).',
                dropdownOptions: [
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                ],
              })
              .stdAppearancePanels(['font', 'dimensions', 'marginPadding'], removeStyleRouter)
              .toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };
};
