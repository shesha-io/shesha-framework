import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  // Generate unique IDs for major components
  const commonTabId = nanoid();
  const commonStyleRouterId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();
  const eventsTabId = nanoid();
  const stylePnlCustomId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
              .addSettingsInput({ inputType: 'textField', propertyName: 'label', label: 'Heading', jsSetting: true })
              .stdVisibleEditableInputs('full')
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'hideHeading', label: 'Hide Heading', jsSetting: true },
                { type: 'switch', label: 'Hide When Empty', propertyName: 'hideWhenEmpty', jsSetting: true },
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
              .addPropertyRouter({ id: styleRouterId, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouterId)
                  .stdDimensionsPanel()
                  .stdBorderPanel(removeStyleRouter !== true)
                  .stdBackgroundPanel(removeStyleRouter !== true)
                  .stdShadowPanel()
                  .stdMarginPaddingPanel()
                  .addCollapsiblePanel({ label: 'Custom Styles', labelAlign: 'right', ghost: true, collapsible: 'header',
                    content: {
                      id: stylePnlCustomId,
                      components: fbf(stylePnlCustomId)
                        .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                        .addSettingsInput({ inputType: 'textField', propertyName: 'className', label: 'Custom CSS Class' })
                        .toJson(),
                    },
                  })
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
