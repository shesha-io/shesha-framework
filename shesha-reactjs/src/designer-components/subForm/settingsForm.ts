import { SettingsFormMarkupFactory } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addContextPropertyAutocomplete({ propertyName: "propertyName", label: "Property Name", size: "small", validate: { required: true }, styledLabel: true, jsSetting: true })
              .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
              .stdVisibleEditableInputs('full')
              .addSettingsInput({ inputType: "dropdown", propertyName: "formSelectionMode", label: "Form Selection Mode", tooltip: "Determines how form data is selected and processed",
                dropdownOptions: [{ label: "Name", value: "name" }, { label: "Dynamic", value: "dynamic" }],
              })
              .addSettingsInput({ inputType: "formTypeAutocomplete", propertyName: "formType", label: "Form Type", jsSetting: true,
                visibleJs: 'return getSettingValue(data?.formSelectionMode) === "dynamic";',
              })
              .addSettingsInput({ inputType: "formAutocomplete", propertyName: "formId", label: "Form", jsSetting: true,
                visibleJs: 'return getSettingValue(data?.formSelectionMode) !== "dynamic";',
              })
              .addSettingsInput({ inputType: "dropdown", propertyName: "dataSource", label: "Data Source", tooltip: "The list data to be used can be the data that comes with the form of can be fetched from the API",
                dropdownOptions: [{ label: "Form", value: "form" }, { label: "API", value: "api" }],
              })
              .addSettingsInput({ inputType: "dropdown", propertyName: "apiMode", label: "API Mode", tooltip: "The API mode to use to fetch data", jsSetting: true,
                dropdownOptions: [{ label: "Entity name", value: "entityName" }, { label: "URL", value: "url" }],
                visibleJs: 'return getSettingValue(data?.dataSource) !== "form";',
              })
              .addSettingsInput({ inputType: "entityTypeAutocomplete", propertyName: "entityType", label: "Entity Type", jsSetting: true,
                visibleJs: 'return !(getSettingValue(data?.dataSource) === "form" || getSettingValue(data?.apiMode) !== "entityName");',
              })
              .addSettingsInput({ inputType: "codeEditor", propertyName: "properties", label: "Properties", language: "graphql", description: "Properties in GraphQL-like syntax",
                jsSetting: true, mode: "inline", wrapInTemplate: false, visibleJs: 'return getSettingValue(data?.entityType);',
                desktop: { dimensions: { height: 'fit-content' } },
              })
              .addSettingsInputRow({ inputs: [
                { type: "codeEditor", propertyName: "queryParams", label: "Query Params",
                  visibleJs: 'return getSettingValue(data?.dataSource) !== "form";',
                  tooltip: "The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id",
                  description: "The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id",
                  wrapInTemplate: true, templateSettings: { functionName: 'getQueryParams' },
                },
                { type: "codeEditor", propertyName: "getUrl", label: "GET URL", tooltip: "The API URL that will be used to fetch the data. Write the code that returns the string",
                  mode: "dialog", description: "The API URL that will be used to fetch the data. Write the code that returns the string",
                  visibleJs: 'return getSettingValue(data?.dataSource) !== "form" && getSettingValue(data?.apiMode) !== "entityName";',
                  wrapInTemplate: true, templateSettings: { functionName: 'getGetUrl' },
                },
              ] })
              .addSettingsInputRow({ inputs: [
                { type: "codeEditor", propertyName: "postUrl", label: "POST URL", tooltip: "The API URL that will be used to create new data. Write a function that returns this URL as a string.",
                  mode: "dialog", description: "The API URL that will be used to update data. Write the code that returns the string",
                  visibleJs: 'return getSettingValue(data?.dataSource) !== "form";',
                  wrapInTemplate: true, templateSettings: { functionName: 'getPostUrl' },
                },
                { type: "codeEditor", propertyName: "putUrl", label: "PUT URL", tooltip: "The API URL that will be used to update data. Write the code that returns the string",
                  mode: "dialog", description: "The API URL that will be used to update data. Write the code that returns the string",
                  visibleJs: 'return getSettingValue(data?.dataSource) !== "form";',
                  wrapInTemplate: true, templateSettings: { functionName: 'getPutUrl' },
                },
              ] })
              .toJson(),
          },
          { key: 'events', title: 'Events', id: eventsTabId,
            components: fbf(eventsTabId)
              .addSettingsInput({ inputType: "codeEditor", propertyName: "onCreated", label: "On Post Data", tooltip: "Triggered after successfully creating a new sub-form object in the back-end",
                mode: "dialog", description: "Triggered after successfully creating a new sub-form object in the back-end",
                wrapInTemplate: true, templateSettings: { functionName: 'onCreated' },
              })
              .addSettingsInput({ inputType: "codeEditor", propertyName: "onUpdated", label: "On Put Data", tooltip: "Triggered after successfully updating the sub-form object in the back-end",
                mode: "dialog", description: "Triggered after successfully updating the sub-form object in the back-end",
                wrapInTemplate: true, templateSettings: { functionName: 'onUpdated' },
              })
              .toJson(),
          },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: { _mode: "code", _code: "return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf()
                  .stdCollapsiblePanel('Custom Styles', (fbf) => fbf
                    .addSettingsInputRow({ inputs: [
                      { type: "numberField", propertyName: "wrapperCol", label: "Wrapper Col", jsSetting: true, min: 0, max: 24, step: 1 },
                      { type: "numberField", propertyName: "labelCol", label: "Label Col", jsSetting: true, min: 0, max: 24, step: 1 },
                    ] }),
                  )
                  .toJson(),
              })
              .toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: {
      isSettingsForm: true,
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
