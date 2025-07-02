import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { FormLayout } from 'antd/es/form/Form';

const searchableTabsId = nanoid();
const commonTabId = nanoid();
const itemsTabId = nanoid();
const appearanceTabId = nanoid();
const securityTabId = nanoid();
const styleRouterId = nanoid();
const pnlFontStyleId = nanoid();
const dimensionsStylePnlId = nanoid();

export const getSettings = (data: any) => {
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
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  parentId: commonTabId,
                  label: 'Property Name',
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  styledLabel: true,
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
            key: 'data',
            title: 'Data',
            id: itemsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  parentId: itemsTabId,
                  inputType: 'referenceListAutocomplete',
                  propertyName: 'referenceList',
                  label: 'Reference List',
                  tooltip: 'Make sure to reselect the reference list if any changes are made to its items',
                  filter: { and: [{ '==': [{ var: 'isLast' }, true] }] },
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'items',
                  label: 'Items',
                  labelAlign: 'right',
                  parentId: itemsTabId,
                  referenceList: {
                    _code: 'return getSettingValue(data?.referenceList);',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputType: 'RefListItemSelectorSettingsModal',
                })
                .toJson(),
            ],
          },
          {
            key: 'appearance',
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
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlFontStyle',
                        label: 'Font',
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: pnlFontStyleId,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: pnlFontStyleId,
                                inline: true,
                                propertyName: 'font',
                                inputs: [
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    label: 'Family',
                                    propertyName: 'font.type',
                                    hideLabel: true,
                                    dropdownOptions: fontTypes,
                                  },
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    label: 'Size',
                                    propertyName: 'font.size',
                                    defaultValue: 14,
                                    hideLabel: true,
                                    width: 50,
                                  },
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    label: 'Weight',
                                    propertyName: 'font.weight',
                                    hideLabel: true,
                                    tooltip: 'Controls text thickness (light, normal, bold, etc.)',
                                    dropdownOptions: fontWeights,
                                    width: 100,
                                  },
                                  {
                                    type: 'colorPicker',
                                    id: nanoid(),
                                    label: 'Color',
                                    hideLabel: true,
                                    propertyName: 'font.color',
                                  },
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    label: 'Align',
                                    propertyName: 'font.align',
                                    hideLabel: true,
                                    width: 60,
                                    dropdownOptions: textAlign,
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlDimensions',
                        label: 'Dimensions',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: dimensionsStylePnlId,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dimensionsStylePnlId,
                                inline: true,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Width',
                                    width: 85,
                                    propertyName: 'width',
                                    icon: 'widthIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                    defaultValue: '150px',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Height',
                                    width: 85,
                                    propertyName: 'height',
                                    icon: 'heightIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                    defaultValue: '35px',
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'stylingBox',
                        label: 'Margin & Padding',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addStyleBox({
                                id: nanoid(),
                                label: 'Margin Padding',
                                hideLabel: true,
                                propertyName: 'stylingBox',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .toJson(),
                  ],
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlColorSettings',
                  label: 'Color Settings',
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
                          propertyName: 'colorSource',
                          label: 'Color Source',
                          inputType: 'dropdown',
                          jsSetting: true,
                          tooltip: 'Hex and RGB colors are supported',
                          parentId: styleRouterId,
                          defaultValue: 'primary',
                          dropdownOptions: [
                            { value: 'primary', label: 'Primary color' },
                            { value: 'custom', label: 'Custom color' },
                            { value: 'reflist', label: 'From reflist item' },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: styleRouterId,
                          hidden: {
                            _code: 'return  getSettingValue(data?.colorSource) !== "custom";',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: 'activeColor',
                              label: 'Active Color',
                              type: 'colorPicker',
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          propertyName: 'showIcons',
                          label: 'Show Icons',
                          inputType: 'switch',
                          jsSetting: true,
                          parentId: styleRouterId,
                        })
                        .toJson(),
                    ],
                  },
                })
                .toJson(),
            ],
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
                  jsSetting: true,
                  size: 'small',
                  parentId: securityTabId,
                  tooltip: 'Enter a list of permissions that should be associated with this component',
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
