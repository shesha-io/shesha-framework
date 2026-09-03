import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";
import { SettingsFormMarkupFactory } from "@/interfaces";

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();
  const commonStyleRouterId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
              .stdVisibleEditableInputs('full')
              .addSettingsInput({ inputType: 'columnsList', propertyName: 'columns', label: 'Columns', labelAlign: 'right', tooltip: 'Configure columns', size: 'small' })
              .addSettingsInputRow({ inline: true, inputs: [
                { type: 'numberField', propertyName: 'gutterX', label: 'Gutter X', labelAlign: 'right', jsSetting: true, min: 0 },
                { type: 'numberField', propertyName: 'gutterY', label: 'Gutter Y', labelAlign: 'right', jsSetting: true, min: 0 },
              ] })
              .addPropertyRouter({ id: commonStyleRouterId, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(commonStyleRouterId)
                  .stdDimensionsPanel()
                  .stdMarginPaddingPanel()
                  .toJson(),
              })
              .toJson(),
          },
          { key: 'events', title: 'Events', id: eventsTabId, components: fbf(eventsTabId).stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson() },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addSettingsInputRow({ inline: true, inputs: [
                { type: 'numberField', propertyName: 'gutterX', label: 'Gutter X', labelAlign: 'right', jsSetting: true, min: 0 },
                { type: 'numberField', propertyName: 'gutterY', label: 'Gutter Y', labelAlign: 'right', jsSetting: true, min: 0 },
              ] })
              .addPropertyRouter({ id: styleRouterId, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouterId)
                  .stdDimensionsPanel()
                  .stdBorderPanel(removeStyleRouter !== true)
                  .stdBackgroundPanel(removeStyleRouter !== true)
                  .stdShadowPanel()
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                  .toJson(),
              }).toJson(),
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
