import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";
import { SettingsFormMarkupFactory } from "@/interfaces";

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  // Generate unique IDs for major components
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouter2Id = nanoid();
  const eventsTabId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId, components: fbf(commonTabId)
            .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', size: 'small', jsSetting: true })
            .toJson(),
          },
          { key: 'events', title: 'Events', id: eventsTabId, components: [...fbf(eventsTabId).stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson()] },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouter2Id, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter2Id)
                  .stdFontPanel()
                  .stdDimensionsPanel()
                  .stdBorderPanel(removeStyleRouter !== true)
                  .stdBackgroundPanel(removeStyleRouter !== true)
                  .stdShadowPanel()
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Custom Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                  .addSettingsInput({ inputType: 'textField', jsSetting: true, propertyName: 'className', label: 'Custom CSS Class', tooltip: 'A custom class name to apply to the element' })
                  .toJson(),
              }).toJson(),
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
