import { FormLayout } from 'antd/lib/form/Form';
import { buttonTypes } from './util';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const eventsTabId = nanoid();
  const styleRouter1Id = nanoid();
  const styleRouter2Id = nanoid();
  const styleRouter3Id = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: [...fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', size: 'small', validate: { required: true }, jsSetting: true })
              .addSettingsInput({ propertyName: 'label', label: 'Caption', inputType: 'textField', jsSetting: true })
              .addPropertyRouter({ id: styleRouter1Id, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: [...fbf(styleRouter1Id)
                  .addSettingsInput({ propertyName: 'buttonType', label: 'Style', validate: { required: true }, inputType: 'dropdown', dropdownOptions: buttonTypes })
                  .toJson()],
              })
              .addSettingsInputRow({ inputs: [
                { type: 'iconPicker', propertyName: 'icon', label: 'Icon', size: 'small', jsSetting: true },
                { propertyName: 'iconPosition', label: 'Icon Position', size: 'small', jsSetting: true, type: 'radio',
                  buttonGroupOptions: [
                    { title: 'Start', value: 'start', icon: 'LeftOutlined' },
                    { title: 'End', value: 'end', icon: 'RightOutlined' },
                  ],
                  hidden: { _code: 'return !getSettingValue(data?.icon);', _mode: 'code', _value: false },
                },
              ] })
              .addSettingsInput({ propertyName: 'tooltip', label: 'Tooltip', inputType: 'textArea', jsSetting: true })
              .stdVisibleEditableInputs('full')
              .addConfigurableActionConfigurator({ propertyName: 'actionConfiguration', label: 'On Click' })
              .addPropertyRouter({ id: styleRouter2Id, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: [...fbf(styleRouter2Id)
                  .stdFontPanel()
                  .stdDimensionsPanel()
                  .stdMarginPaddingPanel()
                  .toJson()],
              })
              .toJson(),
            ],
          },
          { key: 'events', title: 'Events', id: eventsTabId, components: [...fbf(eventsTabId).stdEventHandlers(['onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson()] },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouter3Id, componentName: 'propertyRouter3', label: 'Property router3', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: [...fbf(styleRouter3Id)
                  .addSettingsInput({ propertyName: 'buttonType', label: 'Style', validate: { required: true }, inputType: 'dropdown', dropdownOptions: buttonTypes })
                  .stdFontPanel()
                  .stdDimensionsPanel()
                  .stdBorderPanel(removeStyleRouter !== true)
                  .stdBackgroundPanel(removeStyleRouter !== true)
                  .stdShadowPanel()
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Custom Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                  .toJson()],
              }).toJson()],
          },
        ],
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
