import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/es/form/Form';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouter1Id = nanoid();
  const styleRouter2Id = nanoid();
  const eventsTabId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', size: 'small', jsSetting: true })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'visible', label: 'Visible', size: 'small', jsSetting: true, permissionSettings: true },
                { type: 'switch', propertyName: 'closable', label: 'Dismissable', size: 'small', jsSetting: true },
              ] })
              .addSettingsInput({ inputType: 'dropdown', propertyName: 'alertType', label: 'Type', size: 'small', jsSetting: true,
                dropdownOptions: [{ label: 'Success', value: 'success' }, { label: 'Info', value: 'info' }, { label: 'Warning', value: 'warning' }, { label: 'Error', value: 'error' }],
              })
              .addSettingsInput({ inputType: 'textArea', propertyName: 'text', label: 'Message', size: 'small', tooltip: 'The message to display in the alert. You can use variables and expressions.', allowClear: true, jsSetting: true })
              .addSettingsInput({ inputType: 'textArea', propertyName: 'description', label: 'Description', tooltip: 'Additional information about the alert.', jsSetting: true })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'showIcon', label: 'Show Icon', size: 'small', jsSetting: true },
                { type: 'switch', propertyName: 'marquee', label: 'Marquee', size: 'small', tooltip: 'If enabled, the content will scroll horizontally.', jsSetting: true },
              ] })
              .addSettingsInputRow({ inputs: [
                { type: 'iconPicker', propertyName: 'icon', label: 'Icon', size: 'small', jsSetting: true, hidden: { _code: 'return !getSettingValue(data?.showIcon);', _mode: 'code', _value: false } },
              ] })
              .addPropertyRouter({ id: styleRouter1Id, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter1Id)
                  .stdDimensionsPanel()
                  .stdMarginPaddingPanel()
                  .toJson(),
              })
              .toJson(),
          },
          { key: 'events', title: 'Events', id: eventsTabId, components: [...fbf(eventsTabId).stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson()] },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouter2Id, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter2Id)
                  .stdDimensionsPanel()
                  .stdShadowPanel()
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Custom Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                  .toJson(),
              }).toJson(),
          },
        ],
      }).toJson(),
    formSettings: {
      isSettingsForm: true,
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
