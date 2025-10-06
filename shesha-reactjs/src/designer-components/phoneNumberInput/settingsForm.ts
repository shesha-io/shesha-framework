import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { IPhoneNumberInputComponentProps } from './interfaces';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: IPhoneNumberInputComponentProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const validationTabId = nanoid();
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
            key: '1',
            title: 'Common',
            id: commonTabId,
            components: [...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: 'propertyName',
                label: 'Property Name',
                parentId: commonTabId,
                styledLabel: true,
                size: 'small',
                validate: {
                  required: true,
                },
                jsSetting: true,
              })
              .addLabelConfigurator({
                id: nanoid(),
                propertyName: 'hideLabel',
                label: 'Label',
                parentId: commonTabId,
                hideLabel: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'placeholder',
                    label: 'Placeholder',
                    size: 'small',
                    jsSetting: true,
                  },
                  {
                    type: 'textArea',
                    id: nanoid(),
                    propertyName: 'description',
                    label: 'Tooltip',
                    jsSetting: true,
                  },
                ],
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
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'hidden',
                    label: 'Hide',
                    jsSetting: true,
                    layout: 'horizontal',
                  },
                ],
              })
              .addDropdown({
                id: nanoid(),
                propertyName: 'valueFormat',
                label: 'Value Format',
                parentId: commonTabId,
                size: 'small',
                dataSourceType: 'values',
                values: [
                  { id: 'fullNumber', label: 'Full Number (e.g. +27123456789)' },
                  { id: 'object', label: 'Object (number, dialCode, countryCode)' },
                ],
                jsSetting: false,
                description: 'Choose how the phone number value should be returned',
              })
              .addEditableTagGroupProps({
                id: nanoid(),
                propertyName: 'allowedDialCodes',
                label: 'Allowed Dial Codes',
                parentId: commonTabId,
                description: 'List of allowed dial codes (e.g., +27, +1, +44). Leave empty to allow all countries.',
                jsSetting: true,
              })
              // .addSizeConfigurator({
              //   id: nanoid(),
              //   propertyName: 'size',
              //   parentId: commonTabId,
              //   label: 'Size',
              //   jsSetting: true,
              // })
               .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'size',
                label: 'Size',
                parentId: commonTabId,
                allowClear: true,
                dropdownOptions: [
                  { label: 'Small', value: 'small' },
                  { label: 'Middle', value: 'middle' },
                  { label: 'Large', value: 'large' },
                ],
              })
              .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Validation',
            id: validationTabId,
            components: [...new DesignerToolbarSettings()
              .addCheckbox({
                id: nanoid(),
                propertyName: 'validate.required',
                label: 'Required',
                parentId: validationTabId,
                jsSetting: true,
              })
              .addTextArea({
                id: nanoid(),
                propertyName: 'customValidationCode',
                label: 'Custom Validation',
                parentId: validationTabId,
                description: 'Enter custom validation code to be executed',
                jsSetting: false,
              })
              .toJson(),
            ],
          },
          // {
          //   key: '3',
          //   title: 'Events',
          //   id: eventsTabId,
          //   components: [...new DesignerToolbarSettings()
          //     .addCustomFunctionButton({
          //       id: nanoid(),
          //       propertyName: 'onChangeCustom',
          //       label: 'On Change',
          //       parentId: eventsTabId,
          //       description: 'Custom code to execute on value change',
          //     })
          //     .addCustomFunctionButton({
          //       id: nanoid(),
          //       propertyName: 'onFocusCustom',
          //       label: 'On Focus',
          //       parentId: eventsTabId,
          //       description: 'Custom code to execute when input gains focus',
          //     })
          //     .addCustomFunctionButton({
          //       id: nanoid(),
          //       propertyName: 'onBlurCustom',
          //       label: 'On Blur',
          //       parentId: eventsTabId,
          //       description: 'Custom code to execute when input loses focus',
          //     })
          //     .toJson(),
          //   ],
          // },
          {
            key: '4',
            title: 'Appearance',
            id: appearanceTabId,
            components: [...new DesignerToolbarSettings()
            
               .addSettingsInput({
                        id: nanoid(),
                        inputType: 'codeEditor',
                        propertyName: 'style',
                        hideLabel: false,
                        label: 'Style',
                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                      })
              .toJson(),
            ],
          },
          {
            key: '5',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addPermissionAutocomplete({
                id: nanoid(),
                propertyName: 'permissions',
                label: 'Permissions',
                parentId: securityTabId,
              })
              .toJson(),
            ],
          },
        ],
      })
      .toJson(),
  };
};
