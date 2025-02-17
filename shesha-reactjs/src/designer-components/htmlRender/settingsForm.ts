import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from 'nanoid';

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
                .addCodeEditor({
                    id: nanoid(),
                    propertyName: 'renderer',
                    parentId: '87667bd9-0ba6-4f29-a7d3-aecdac17da2a',
                    label: 'Render HTML',
                    description: 'Enter custom JSX script that will render a component',
                    exposedVariables: [
                      {
                        id: nanoid(),
                        name: 'data',
                        description: 'Form data',
                        type: 'object',
                      },
                      {
                        id: nanoid(),
                        name: 'globalState',
                        description: 'The global state',
                        type: 'object',
                      },
                    ],
                    wrapInTemplate: true,
                    templateSettings: {
                      "functionName": "renderer"
                    },
                    availableConstantsExpression: async ({ metadataBuilder, data }) => {
                      const { modelType } = data ?? {};
                      const result = metadataBuilder.object("constants");
                      if (modelType) {
                        await result.addEntityAsync("data", "Form data", modelType);
                        await result.addEntityAsync("initialValues", "Initial values", modelType);
                      } else {
                        result.addObject("data", "Form data");
                        result.addObject("initialValues", "Initial values");
                      };
      
                      result.addObject("parentFormValues", "Parent form values. The values of the form rendering the dialog.");
      
                      result.addStandard([
                        "shesha:form",
                        "shesha:globalState",
                        "shesha:setGlobalState",
                        "shesha:http",
                        "shesha:message",
                        "shesha:pageContext",
                        "shesha:contexts",
                        "shesha:moment",
                      ]);
                      return result.build();
                    },
                  })
                  .addCheckbox({
                    id: nanoid(),
                    propertyName: 'hidden',
                    parentId: '87667bd9-0ba6-4f29-a7d3-aecdac17da2a',
                    label: 'Hidden',
                  })
                .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Appearance',
            id: '6Vw9iiDw9d0MD_Rh5cbIn',
            components: [
              ...new DesignerToolbarSettings()
              .addSettingsInput({
                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                id: 'custom-css-412c-8461-4c8d55e5c073',
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
            key: '4',
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
