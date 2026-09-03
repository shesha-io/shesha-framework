import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const commonTabId = nanoid();
  // const eventsTabId = nanoid();
  const styleRouter1Id = nanoid();
  const styleRouter2Id = nanoid();
  const appearanceTabId = nanoid();
  const stylePnlCustomId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
              .stdVisibleEditableInputs('full')
              .addSettingsInput({ propertyName: 'columns', label: 'Columns', parentId: commonTabId, inputType: 'keyInformationBarColumnsList' })
              .addPropertyRouter({ id: styleRouter1Id, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter1Id)
                  .addSettingsInputRow({ inputs: [
                    { type: 'dropdown', propertyName: 'orientation', label: 'Orientation', jsSetting: true,
                      dropdownOptions: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }],
                    },
                    { propertyName: 'alignItems', label: 'Align Items', type: 'dropdown',
                      hidden: { _code: removeStyleRouter === true
                        ? 'return getSettingValue(data?.orientation) !== "horizontal";'
                        : 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.orientation) !== "horizontal";',
                      _mode: 'code', _value: false },
                      dropdownOptions: [{ value: 'flex-start', label: 'Flex Start' }, { value: 'flex-end', label: 'Flex End' }, { value: 'center', label: 'Center' }],
                    },
                  ] })
                  .addSettingsInput({ propertyName: 'gap', label: 'Gap', inputType: 'numberField', jsSetting: true })
                  .stdCollapsiblePanel('Divider', (fbf) => fbf
                    .addSettingsInputRow({ inputs: [
                      { propertyName: 'dividerMargin', label: 'Divider Margin', type: 'textField', jsSetting: true, tooltip: 'Sets the margin around the divider' },
                      { propertyName: 'dividerWidth', label: 'Divider Width', type: 'numberField', jsSetting: true, tooltip: 'Sets the width of the divider',
                        hidden: { _code: removeStyleRouter === true
                          ? 'return getSettingValue(data?.orientation) !== "vertical";'
                          : 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.orientation) !== "vertical";',
                        _mode: 'code', _value: false },
                      },
                      { propertyName: 'dividerHeight', label: 'Divider Height', type: 'textField', jsSetting: true, tooltip: 'Sets the height of the divider',
                        hidden: { _code: removeStyleRouter === true
                          ? 'return getSettingValue(data?.orientation) !== "horizontal";'
                          : 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.orientation) !== "horizontal";',
                        _mode: 'code', _value: false },
                      }],
                    })
                    .addSettingsInputRow({ inputs: [
                      { propertyName: 'dividerThickness', label: 'Divider Thickness', type: 'textField', jsSetting: true, tooltip: 'Sets the thickness of the divider line' },
                      { propertyName: 'dividerColor', label: 'Divider Color', type: 'colorPicker', jsSetting: true }],
                    }),
                  )
                  .stdDimensionsPanel()
                  .stdMarginPaddingPanel()
                  .toJson(),
              })
              .toJson(),
          },
          // { key: 'events', title: 'Events', id: eventsTabId, components: [...fbf(eventsTabId).stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson()] },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouter2Id, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter2Id)
                  .addSettingsInputRow({ inputs: [
                    { type: 'dropdown', propertyName: 'orientation', label: 'Orientation', jsSetting: true,
                      dropdownOptions: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }],
                    },
                    { propertyName: 'alignItems', label: 'Align Items', type: 'dropdown',
                      hidden: { _code: removeStyleRouter === true
                        ? 'return getSettingValue(data?.orientation) !== "horizontal";'
                        : 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.orientation) !== "horizontal";',
                      _mode: 'code', _value: false },
                      dropdownOptions: [{ value: 'flex-start', label: 'Flex Start' }, { value: 'flex-end', label: 'Flex End' }, { value: 'center', label: 'Center' }],
                    },
                  ] })
                  .addSettingsInput({ propertyName: 'gap', label: 'Gap', inputType: 'numberField', jsSetting: true })
                  .stdCollapsiblePanel('Divider', (fbf) => fbf
                    .addSettingsInputRow({ inputs: [
                      { propertyName: 'dividerMargin', label: 'Divider Margin', type: 'numberField', jsSetting: true, tooltip: 'Sets the margin around the divider' },
                      { propertyName: 'dividerWidth', label: 'Divider Width', type: 'textField', jsSetting: true, tooltip: 'Sets the width of the divider',
                        hidden: { _code: removeStyleRouter === true
                          ? 'return getSettingValue(data?.orientation) !== "vertical";'
                          : 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.orientation) !== "vertical";',
                        _mode: 'code', _value: false },
                      },
                      { propertyName: 'dividerHeight', label: 'Divider Height', type: 'textField', jsSetting: true, tooltip: 'Sets the height of the divider',
                        hidden: { _code: removeStyleRouter === true
                          ? 'return getSettingValue(data?.orientation) !== "horizontal";'
                          : 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.orientation) !== "horizontal";',
                        _mode: 'code', _value: false },
                      }],
                    })
                    .addSettingsInputRow({ inputs: [
                      { propertyName: 'dividerThickness', label: 'Divider Thickness', type: 'textField', jsSetting: true, tooltip: 'Sets the thickness of the divider line' },
                      { propertyName: 'dividerColor', label: 'Divider Color', type: 'colorPicker', jsSetting: true }],
                    }),
                  )
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
                        .addSettingsInput({ inputType: 'codeEditor', propertyName: 'wrapperStyle', label: 'Items Container Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                        .toJson(),
                    },
                  })
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
