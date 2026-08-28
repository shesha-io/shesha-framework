import { buttonTypes } from '@/designer-components/button/util';
import { SettingsFormMarkupFactory } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getGroupSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: [...fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'name', label: 'Group Name', jsSetting: false, validate: { required: true } })
              .addSettingsInputRow({
                inputs: [
                  { type: "textField", propertyName: "label", label: "Label" },
                  { type: "textArea", propertyName: "tooltip", label: "Group Tooltip", labelAlign: "right" },
                ],
              })
              .addSettingsInputRow({
                inputs: [
                  { type: "iconPicker", propertyName: "icon", label: "Icon", labelAlign: "right" },
                  { type: "iconPicker", propertyName: "downIcon", label: "Down Icon", labelAlign: "right" },
                ],
              })
              .addSettingsInput({ inputType: "dropdown", propertyName: "buttonType", label: "Button Type", labelAlign: "right", dropdownOptions: buttonTypes, jsSetting: false })
              .stdVisibleEditableInputs('disabling')
              .addSettingsInput({ inputType: 'switch', label: 'Hide When Empty', propertyName: 'hideWhenEmpty', jsSetting: true })
              .toJson(),
            ],
          },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId)
              .stdFontPanel()
              .stdDimensionsPanel()
              .stdBorderPanel(false)
              .stdBackgroundPanel(false)
              .stdShadowPanel()
              .stdMarginPaddingPanel()
              .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Custom Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
              .toJson(),
            ],
          },
        ],
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
      isSettingsForm: true,
    },
  };
};
