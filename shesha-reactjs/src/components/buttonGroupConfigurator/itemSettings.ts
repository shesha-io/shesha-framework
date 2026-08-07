import { buttonTypes } from '@/designer-components/button/util';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getItemSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const eventsTabId = nanoid();

  const entityOrUrl = 'getSettingValue(data?.itemSubType) == "separator" || getSettingValue(data?.itemSubType) === "dynamic" && (getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Entity" && getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Url")';

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: [...fbf(commonTabId)
              .addSettingsInput({
                inputType: "dropdown", propertyName: "itemSubType", label: "Item Type", labelAlign: "right", jsSetting: false, validate: { required: true },
                dropdownOptions: [{ label: "Button", value: "button" }, { label: "Separator", value: "separator" }, { label: "Dynamic item(s)", value: "dynamic" }],
              })
              .stdContainer((fbf) => fbf
                .addSettingsInput({ inputType: 'textField', propertyName: 'name', label: 'Name', jsSetting: false, validate: { required: true } })
                .addSettingsInputRow({
                  visibleJs: 'return  getSettingValue(data?.itemSubType) === "button";',
                  inputs: [
                    { type: "textField", propertyName: "label", label: "Caption", jsSetting: true },
                    { type: "textArea", propertyName: "tooltip", label: "Tooltip", labelAlign: "right", jsSetting: true },
                  ],
                })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'iconPicker', propertyName: 'icon', label: 'Icon', size: 'small', jsSetting: true },
                    { propertyName: 'iconPosition', label: 'Icon Position', size: 'small', jsSetting: true, type: 'radio',
                      buttonGroupOptions: [
                        { title: 'Start', value: 'start', icon: 'LeftOutlined' },
                        { title: 'End', value: 'end', icon: 'RightOutlined' },
                      ],
                      visibleJs: 'return  getSettingValue(data?.icon);',
                    },
                  ],
                })
                .stdVisibleEditableInputs('disabling')
                .addConfigurableActionConfigurator({ propertyName: 'actionConfiguration', label: 'On Click' }),
              { _code: 'return  getSettingValue(data?.itemSubType) !== "button";', _mode: 'code', _value: false },
              )
              .addSettingsInput({
                visibleJs: 'return  getSettingValue(data?.itemSubType) === "dynamic";',
                inputType: "dynamicItemsConfigurator", propertyName: "dynamicItemsConfiguration",
                componentName: "configurableActionConfigurator1", hideLabel: true, labelAlign: "right",
                _formFields: ["propertyName", "description", "customVisibility"], label: "",
              })
              .toJson(),
            ],
          },
          { key: 'events', title: 'Events', id: eventsTabId,
            hidden: {
              _code: 'return getSettingValue(data?.itemSubType) === "dynamic" && (getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Entity" && getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Url")',
              _mode: 'code',
              _value: false,
            },
            components: [...fbf(eventsTabId).stdEventHandlers(['onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson()],
          },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            hidden: {
              _code: 'return getSettingValue(data?.itemSubType) === "dynamic" && (getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Entity" && getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Url")',
              _mode: 'code',
              _value: false,
            },
            components: [...fbf(appearanceTabId)
              .addSettingsInputRow({
                inputs: [
                  { propertyName: 'buttonType', label: 'Style', validate: { required: true }, type: 'dropdown',
                    dropdownOptions: buttonTypes, hidden: { _code: `return ${entityOrUrl};`, _mode: 'code', _value: false },
                  },
                  { type: 'textField', propertyName: 'dividerWidth', label: "Thickness",
                    hidden: { _code: 'return  getSettingValue(data?.itemSubType) !== "separator";', _mode: 'code', _value: false },
                  },
                  { type: 'colorPicker', propertyName: 'dividerColor', label: 'Color',
                    hidden: { _code: 'return  getSettingValue(data?.itemSubType) !== "separator";', _mode: 'code', _value: false },
                  },
                ],
              })
              .stdContainer((fbf) => fbf.stdFontPanel(), { _code: `return getSettingValue(data?.itemSubType) == "separator" || ${entityOrUrl};`, _mode: 'code', _value: false })
              .stdContainer((fbf) => fbf.stdDimensionsPanel(), { _code: `return getSettingValue(data?.itemSubType) == "separator" || ${entityOrUrl};`, _mode: 'code', _value: false })
              .stdContainer((fbf) => fbf.stdBorderPanel(false), { _code: `return ["dashed","text", "link", "ghost"].includes(getSettingValue(data?.buttonType)) || getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false })
              .stdContainer((fbf) => fbf.stdBackgroundPanel(false), { _code: `return ["text", "link", "primary", "ghost"].includes(getSettingValue(data?.buttonType)) || getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false })
              .stdContainer((fbf) => fbf.stdShadowPanel(), { _code: `return ["text", "link", "ghost"].includes(getSettingValue(data?.buttonType)) || getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false })
              .stdContainer((fbf) => fbf.stdMarginPaddingPanel(), { _code: `return getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false })
              .stdContainer((fbf) => fbf.addSettingsInput({
                inputType: 'codeEditor', propertyName: 'style', label: 'Custom Style',
                description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' }),
              { _code: `return  getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false })
              .toJson()],
          },
        ],
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
      isSettingsForm: true,
    },
  };
};
