import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  // Generate unique IDs for major components
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();
  const eventsTabId = nanoid();
  const stylePnlCustomId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
                .stdVisibleEditableInputs('full')
                .addSettingsInput({ inputType: 'switch', propertyName: 'noDefaultStyling', label: 'No Default Styling', size: 'small', tooltip: 'If checked, the default styles and classes of the container will not be applied.', jsSetting: true })
                .toJson(),
            ],
          },
          { key: 'events', title: 'Events', id: eventsTabId, components: [...fbf(eventsTabId).stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson()] },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: [
                  ...fbf(styleRouterId)
                    .stdLayoutPanel(removeStyleRouter !== true)
                    .stdDimensionsPanel()
                    .stdBorderPanel(removeStyleRouter !== true)
                    .stdBackgroundPanel(removeStyleRouter !== true)
                    .stdShadowPanel()
                    .stdMarginPaddingPanel()
                    .addCollapsiblePanel({ label: 'Custom Styles', labelAlign: 'right', ghost: true, collapsible: 'header',
                      content: {
                        id: stylePnlCustomId,
                        components: [...fbf(stylePnlCustomId)
                          .addSettingsInput({ inputType: 'textField', propertyName: 'className', label: 'Custom CSS Class' })
                          .addSettingsInput({ inputType: 'codeEditor', propertyName: 'wrapperStyle', label: 'Wrapper Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                          .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                          .toJson(),
                        ],
                      },
                    })
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
