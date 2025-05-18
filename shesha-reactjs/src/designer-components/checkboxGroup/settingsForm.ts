import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: any) => {
  // Generate unique IDs for major components
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const validationTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const stylePanelId = nanoid();

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
            components: [
              ...new DesignerToolbarSettings()
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
                      defaultValue: 'inherited',
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
                .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'dropdown',
                  propertyName: 'mode',
                  label: 'Mode',
                  size: 'small',
                  jsSetting: true,
                  parentId: dataTabId,
                  dropdownOptions: [
                    {
                      label: 'Single',
                      value: 'single',
                    },
                    {
                      label: 'Multiple',
                      value: 'multiple',
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'dropdown',
                  propertyName: 'dataSourceType',
                  label: 'Data Source Type',
                  size: 'small',
                  jsSetting: true,
                  parentId: dataTabId,
                  dropdownOptions: [
                    {
                      label: 'Values',
                      value: 'values',
                    },
                    {
                      label: 'Reference list',
                      value: 'referenceList',
                    },
                    {
                      label: 'API URL',
                      value: 'url',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return  getSettingValue(data?.dataSourceType) !== "values";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'labelValueEditor',
                      propertyName: 'items',
                      parentId: dataTabId,
                      label: 'Items',
                      labelTitle: 'Label',
                      labelName: 'label',
                      valueTitle: 'Value',
                      valueName: 'value',
                      mode: 'dialog',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return  getSettingValue(data?.dataSourceType) !== "referenceList";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      type: 'referenceListAutocomplete',
                      id: nanoid(),
                      propertyName: 'referenceListId',
                      label: 'Reference List',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return  getSettingValue(data?.dataSourceType) !== "url";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      type: 'codeEditor',
                      id: nanoid(),
                      propertyName: 'dataSourceUrl',
                      label: 'Data Source URL',
                      jsSetting: true,
                    },
                    {
                      type: 'codeEditor',
                      id: nanoid(),
                      propertyName: 'reducerFunc',
                      label: 'Reducer Function',
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Validation',
            id: validationTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'validate.required',
                  label: 'Required',
                  inputType: 'switch',
                  size: 'small',
                  layout: 'horizontal',
                  jsSetting: true,
                  parentId: validationTabId,
                })
                .toJson(),
            ],
          },
          {
            key: '4',
            title: 'Events',
            id: eventsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onChangeCustom',
                  label: 'On Change',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on changing of event.',
                  parentId: eventsTabId,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onFocusCustom',
                  label: 'On Focus',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on focus of event.',
                  parentId: eventsTabId,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onBlurCustom',
                  label: 'On Blur',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on blur of event.',
                  parentId: eventsTabId,
                })
                .toJson(),
            ],
          },
          {
            key: '5',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: styleRouterId,
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router1',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  hidden: false,
                  propertyRouteName: {
                    _mode: 'code',
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: '',
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'dropdown',
                        propertyName: 'direction',
                        label: 'Direction',
                        size: 'small',
                        jsSetting: true,
                        parentId: styleRouterId,
                        defaultValue: 'horizontal',
                        dropdownOptions: [
                          {
                            label: 'Horizontal',
                            value: 'horizontal',
                          },
                          {
                            label: 'Vertical',
                            value: 'vertical',
                          },
                        ],
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'customStyle',
                        label: 'Custom Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'style',
                                hideLabel: false,
                                label: 'Style',
                                parentId: stylePanelId,
                                description:
                                  'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '6',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: securityTabId,
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
