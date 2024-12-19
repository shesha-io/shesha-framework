import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: any) => {
  return {
    components: new DesignerToolbarSettings(data)
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
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                  propertyName: 'propertyName',
                  label: 'Property Name',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  styledLabel: true,
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
                })
                .addLabelConfigurator({
                  id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                  propertyName: 'hideLabel',
                  label: 'label',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  hideLabel: true,
                })
                .addSettingsInput({
                  inputType: 'textArea',
                  id: 'tooltip-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'description',
                  label: 'Tooltip',
                  jsSetting: true,
                })
                .addSettingsInput({
                  inputType: 'editModeSelector',
                  id: 'editMode-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'editMode',
                  label: 'Edit Mode',
                  defaultValue: 'inherit',
                  size: 'small',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'switch',
                      id: 's4gmBg31azZC0UjZjpfTm',
                      propertyName: 'isDragger',
                      label: 'Is Dragger',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: 'hidden-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'hidden',
                      label: 'Hide',
                      jsSetting: true,
                      layout: 'horizontal',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: 'ss4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  label: 'File Upload Settings',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'switch',
                      id: 'new-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'allowUpload',
                      label: 'Allow Upload',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: 'allowDelete-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'allowDelete',
                      label: 'Allow Delete',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: 'allowReplace-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'allowReplace',
                      label: 'Allow Replace',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInput({
                  inputType: 'switch',
                  id: 'useSync-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'useSync',
                  label: 'Synchronous upload',
                  jsSetting: true,
                })
                .addSettingsInput({
                  inputType: 'text',
                  id: 'ownerid-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'ownerId',
                  label: 'Owner Id',
                  jsSetting: true,
                })
                .addSettingsInput({
                  inputType: 'autocomplete',
                  id: 'ownertype-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'ownerType',
                  dataSourceType: 'url',
                  dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                  label: 'Owner Type',
                })
                .addSettingsInput({
                  inputType: 'editableTagGroupProps',
                  id: 'allowedFileTypes-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'allowedFileTypes',
                  label: 'Allowed File Types',
                  jsSetting: true,
                })
                .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Validation',
            id: '6eBJvoll3xtLJxdvOAlnB',
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
                  propertyName: 'validate.required',
                  label: 'Required',
                  inputType: 'switch',
                  size: 'small',
                  layout: 'horizontal',
                  jsSetting: true,
                  parentId: '6eBJvoll3xtLJxdvOAlnB',
                })
                .addSettingsInputRow({
                  id: 'qOkkwAnHvKJ0vYXeXMLsd',
                  parentId: '6eBJvoll3xtLJxdvOAlnB',
                  inputs: [
                    {
                      type: 'number',
                      id: 'minLength-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'validate.minLength',
                      label: 'Min Length',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'number',
                      id: 'maxLength-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'validate.maxLength',
                      label: 'Max Length',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: 'Scip2BCqWk6HniFIJTgtA',
                  parentId: '6eBJvoll3xtLJxdvOAlnB',
                  inputs: [
                    {
                      type: 'text',
                      id: 'message-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'validate.message',
                      label: 'Message',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'codeEditor',
                      id: 'validator-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'validate.validator',
                      label: 'Validator',
                      labelAlign: 'right',
                      tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise',
                    },
                  ],
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .toJson(),
            ],
          },
          {
            key: '5',
            title: 'Security',
            id: '6Vw9iiDw9d0MD_Rh5cbIn',
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
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
