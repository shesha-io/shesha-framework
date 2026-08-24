import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const eventsTabId = nanoid();
  const styleRouter1Id = nanoid();
  const styleRouter2Id = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
              .addSettingsInput({ inputType: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true })
              .addSettingsInputRow({ inputs: [
                { type: 'dropdown', propertyName: 'orientation', label: 'Orientation', jsSetting: true,
                  dropdownOptions: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }],
                },
                { type: 'switch', propertyName: 'inline', label: 'Inline', size: 'small', jsSetting: true,
                  hidden: { _code: 'return  getSettingValue(data?.orientation) === "vertical";', _mode: 'code', _value: false },
                },
              ],
              })
              .stdContainer((fbf) => fbf
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true,
                  labelAlignOptions: [
                    { value: 'left', icon: 'AlignLeftOutlined', title: 'Left' },
                    { value: 'center', icon: 'AlignCenterOutlined', title: 'Center' },
                    { value: 'right', icon: 'AlignRightOutlined', title: 'Right' },
                  ],
                })
                .addSettingsInput({
                  inputType: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true,
                  hidden: { _code: 'return  getSettingValue(data?.orientation) === "vertical";', _mode: 'code', _value: false },
                }),
              'return  getSettingValue(data?.orientation) !== "vertical";',
              )
              .addPropertyRouter({ id: styleRouter1Id, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter1Id)
                  .stdCollapsiblePanel('Line Style', (fbf) => fbf
                    .addSettingsInputRow({ inline: true, propertyName: 'lineFont', inputs: [
                      { type: 'numberField', label: 'Thickness', propertyName: 'lineFont.size', hideLabel: false, width: 50 },
                      { type: 'colorPicker', label: 'Color', hideLabel: false, propertyName: 'lineFont.color' },
                      { type: 'dropdown', label: 'Type', propertyName: 'lineType', hideLabel: false,
                        dropdownOptions: [{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }],
                      },
                    ] })
                    .addSettingsInput({ visibleJs: 'return  getSettingValue(data?.orientation) === "horizontal";',
                      inputType: 'dimensionField', dimensionType: 'width', label: 'Width', propertyName: 'lineWidth',
                    })
                    .addSettingsInput({ visibleJs: 'return  getSettingValue(data?.orientation) === "vertical";',
                      inputType: 'dimensionField', dimensionType: 'height', label: 'Height', propertyName: 'lineHeight',
                    }), true)
                  .stdCollapsiblePanel('Title Style', (fbf) => fbf.stdFontControls(undefined, ['align']), true)
                  .stdCollapsiblePanel('Container Style', (fbf) => fbf.addStyleBox({ label: 'Margin Padding', hideLabel: true, propertyName: 'containerStylingBoxJson', format: 'json' }), true)
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
                  .stdCollapsiblePanel('Line Style', (fbf) => fbf
                    .addSettingsInputRow({ inline: true, propertyName: 'lineFont', inputs: [
                      { type: 'numberField', label: 'Thickness', propertyName: 'lineFont.size', hideLabel: false, width: 50 },
                      { type: 'colorPicker', label: 'Color', hideLabel: false, propertyName: 'lineFont.color' },
                      { type: 'dropdown', label: 'Type', propertyName: 'lineType', hideLabel: false,
                        dropdownOptions: [{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }],
                      },
                    ] })
                    .addSettingsInput({ visibleJs: 'return  getSettingValue(data?.orientation) === "horizontal";',
                      inputType: 'dimensionField', dimensionType: 'width', label: 'Width', propertyName: 'lineWidth',
                    })
                    .addSettingsInput({ visibleJs: 'return  getSettingValue(data?.orientation) === "vertical";',
                      inputType: 'dimensionField', dimensionType: 'height', label: 'Height', propertyName: 'lineHeight',
                    }))
                  .stdCollapsiblePanel('Title Style', (fbf) => fbf
                    .stdFontControls(undefined, ['align'])
                    .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', hideLabel: false, label: 'Style',
                      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                    }))
                  .stdCollapsiblePanel('Container Style', (fbf) => fbf
                    .addStyleBox({ label: 'Margin Padding', hideLabel: true, propertyName: 'containerStylingBoxJson', format: 'json' })
                    .addSettingsInput({ inputType: 'codeEditor', propertyName: 'wrapperStyle', hideLabel: false, label: 'Style',
                      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                    }))
                  .toJson(),
              })
              .toJson(),
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
