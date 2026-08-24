import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  // Generate unique IDs for main sections
  const commonTabId = nanoid();
  const commonStyleRouterId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, size: 'small',
        tabs: [
          { id: commonTabId, key: 'common', title: 'Common',
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
              .stdVisibleEditableInputs('full')
              .addSettingsInputRow({ inputs: [
                { propertyName: 'expandIconPosition', label: 'Icon Position', type: 'dropdown', jsSetting: true,
                  dropdownOptions: [{ label: 'Hide', value: 'hide' }, { label: 'Start', value: 'start' }, { label: 'End', value: 'end' }],
                },
                { propertyName: 'collapsible', label: 'Collapsible', type: 'dropdown', jsSetting: true, version: 3,
                  dropdownOptions: [{ label: 'Header', value: 'header' }, { label: 'Icon', value: 'icon' }, { label: 'Disabled', value: 'disabled' }],
                },
              ] })
              .addSettingsInputRow({ labelAlign: 'right', inputs: [
                { propertyName: 'collapsedByDefault', label: 'Collapsed By Default', labelAlign: 'right', type: 'switch', jsSetting: true },
                { propertyName: 'hideWhenEmpty', label: 'Hide When Empty', labelAlign: 'right', type: 'switch', jsSetting: true, description: 'Allows to hide the panel when all components are hidden due to some conditions' },
              ] })
              .addPropertyRouter({ id: commonStyleRouterId, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: [
                  ...fbf(commonStyleRouterId)
                    .stdDimensionsPanel()
                    .stdMarginPaddingPanel()
                    .stdCollapsiblePanel('Header Style', (f) => f
                      .stdFontPanel('headerStyles.font')
                      .stdDimensionsPanel('headerStyles.dimensions', ['width', 'minWidth', 'maxWidth'])
                      .stdBorderPanel(removeStyleRouter !== true, 'headerStyles.border', 'radius')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'headerStyles.background')
                      .stdMarginPaddingPanel('headerStyles.stylingBoxJson'),
                    // .stdCustomStylePanel('headerStyles.style'),
                    true,
                    )
                    .toJson()],
              })
              .toJson(),
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: fbf(eventsTabId)
              .stdEventHandler('onChangeCustom', 'On Collapse/Expand', 'On Collapse/Expand', "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .addBoolean(\"isExpanded\", \"Is panel expanded\")\r\n .build();")
              .stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'])
              .stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], undefined, 'headerEvents', 'Header ')
              .toJson(),
          },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouterId, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouterId)
                  .addSettingsInputRow({ readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false },
                    inputs: [
                      { label: 'Ghost', propertyName: 'ghost', type: 'switch', jsSetting: true },
                      { propertyName: 'isSimpleDesign', label: 'Simple Design', type: 'switch', jsSetting: true },
                    ] })
                  .addSettingsInputRow({ readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false },
                    inputs: [
                      { propertyName: 'accentStyle', label: 'Accent', labelAlign: 'right', type: 'switch', jsSetting: true, description: 'Applies accent styling to panel borders using the primary color' },
                      { propertyName: 'hideCollapseContent', label: 'Hide Top Bar', labelAlign: 'right', type: 'switch', description: 'Hides the collapsible panel', jsSetting: true },
                    ] })
                  .stdDimensionsPanel()
                  .stdBorderPanel(removeStyleRouter !== true)
                  .stdBackgroundPanel(removeStyleRouter !== true)
                  .stdShadowPanel()
                  .stdMarginPaddingPanel()
                  .stdCustomStylePanel()
                  .stdCollapsiblePanel('Header Style', (f) => f
                    .stdFontPanel('headerStyles.font')
                    .stdDimensionsPanel('headerStyles.dimensions', ['width', 'minWidth', 'maxWidth'])
                    .stdBorderPanel(removeStyleRouter !== true, 'headerStyles.border', 'radius')
                    .stdBackgroundPanel(removeStyleRouter !== true, 'headerStyles.background')
                    .stdMarginPaddingPanel('headerStyles.stylingBoxJson'),
                  // .stdCustomStylePanel('headerStyles.style'),
                  true,
                  )
                  .toJson(),
              }).toJson(),
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
