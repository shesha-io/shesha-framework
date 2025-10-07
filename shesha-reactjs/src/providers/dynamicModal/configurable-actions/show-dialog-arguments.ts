import {
  DesignerToolbarSettings,
} from '@/interfaces/toolbarSettings';
import {
  FormLayout,
} from 'antd/lib/form/Form';
import {
  nanoid,
} from '@/utils/uuid';
import { filterDynamicComponents } from '@/designer-components/propertiesTabs/utils';
import { FormMarkupWithSettings } from '@/interfaces';

export const getSettings = (): FormMarkupWithSettings => {
  return {
    components: new DesignerToolbarSettings()
      .addSettingsInputRow({
        id: nanoid(),
        parentId: 'root',
        readOnly: {
          _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false,
        } as any,
        inputs: [
          {
            type: 'textField',
            id: nanoid(),
            propertyName: 'modalTitle',
            label: 'Title',
            validate: {
              required: true,
            },
            jsSetting: true,
          },
          {
            type: 'formAutocomplete',
            id: nanoid(),
            propertyName: 'formId',
            label: 'Modal Form',
            validate: {
              required: true,
            },
            jsSetting: true,
          },
        ],
      })
      .addSettingsInputRow({
        id: nanoid(),
        parentId: 'root',
        readOnly: {
          _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false,
        } as any,
        inputs: [
          {
            type: 'radio',
            id: nanoid(),
            propertyName: 'formMode',
            label: 'Form Mode',
            buttonGroupOptions: [
              {
                title: "Edit",
                value: "edit",
                icon: "editIcon",
              },
              {
                title: "Read only",
                value: "readonly",
                icon: "readonlyIcon",
              },
            ],
            jsSetting: true,
          },
          {
            type: 'customDropdown',
            id: nanoid(),
            propertyName: 'modalWidth',
            label: 'Dialog Width',
            customTooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
            allowClear: true,
            dropdownOptions: [
              {
                label: "Small",
                value: "40%",
              },
              {
                label: "Medium",
                value: "60%",
              },
              {
                label: "Large",
                value: "80%",
              },
            ],
            jsSetting: true,
          },
        ],
      })
      .addSettingsInput({
        id: nanoid(),
        inputType: 'codeEditor',
        propertyName: 'formArguments',
        label: 'Arguments',
        parentId: 'root',
        mode: 'dialog',
        description: 'Arguments you want to be passed to the modal form',
        wrapInTemplate: true,
        templateSettings: {
          useAsyncDeclaration: true,
          functionName: 'getArguments',
        },
        readOnly: {
          _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false,
        } as any,
      })
      .addCollapsiblePanel({
        id: nanoid(),
        propertyName: 'pnlFooter',
        parentId: 'root',
        label: 'Footer',
        labelAlign: "left",
        expandIconPosition: "start",
        ghost: true,
        collapsible: 'header',
        content: {
          id: nanoid(),
          components: [...new DesignerToolbarSettings()
            .addSettingsInputRow({
              id: nanoid(),
              parentId: 'root',
              readOnly: {
                _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false,
              } as any,
              inputs: [
                {
                  type: 'dropdown',
                  id: nanoid(),
                  propertyName: 'footerButtons',
                  label: 'Action Buttons',
                  defaultValue: 'default',
                  dropdownOptions: [
                    {
                      label: "Default",
                      value: "default",
                    },
                    {
                      label: "Custom",
                      value: "custom",
                    },
                    {
                      label: "None",
                      value: "none",
                    },
                  ],
                  jsSetting: true,
                },
                {
                  type: 'buttonGroupConfigurator',
                  id: nanoid(),
                  propertyName: 'buttons',
                  label: 'Configure Modal Buttons',
                  hidden: {
                    _code: 'return !(getSettingValue(data?.footerButtons) === "custom");', _mode: 'code', _value: false,
                  } as any,
                  jsSetting: true,
                },
              ],
            })
            .toJson(),
          ],
        },
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: {
        span: 24,
      },
      wrapperCol: {
        span: 24,
      },
    },
  };
};

export const showDialogComponents = filterDynamicComponents(getSettings().components, '');
