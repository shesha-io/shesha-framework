import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  // Generate unique IDs for main sections
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouter1Id = nanoid();
  const styleRouter2Id = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: [...fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', size: 'small', validate: { required: true } })
              .stdVisibleEditableInputs('disabling')
              .addSettingsInput({ inputType: 'buttonGroupConfigurator', propertyName: 'items', label: 'Button group', title: 'Configure buttons', buttonText: 'Configure buttons', buttonTextReadOnly: 'View configured buttons' })
              .addPropertyRouter({ id: styleRouter1Id, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: [...fbf(styleRouter1Id)
                  .addSettingsInputRow({ inputs: [
                    { type: 'dropdown', propertyName: 'buttonGroupStyle', label: 'Style', jsSetting: true,
                      dropdownOptions: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Menu', value: 'menu' }],
                    },
                    { type: 'dropdown', propertyName: 'gap', label: 'Gap', tooltip: 'The size of space between items', jsSetting: true,
                      dropdownOptions: [{ label: 'Small', value: 'small' }, { label: 'Middle', value: 'middle' }, { label: 'Large', value: 'large' }],
                    },
                  ] })
                  .stdDimensionsPanel()
                  .stdMarginPaddingPanel()
                  .toJson()],
              })
              .toJson(),
            ],
          },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouter2Id, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: [...fbf(styleRouter2Id)
                  .addSettingsInputRow({ inputs: [
                    { type: 'dropdown', propertyName: 'buttonGroupStyle', label: 'Style', jsSetting: true,
                      dropdownOptions: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Menu', value: 'menu' }],
                    },
                    { type: 'dropdown', propertyName: 'gap', label: 'Gap', tooltip: 'The size of space between items', jsSetting: true,
                      dropdownOptions: [{ label: 'Small', value: 'small' }, { label: 'Middle', value: 'middle' }, { label: 'Large', value: 'large' }],
                    },
                  ] })
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
