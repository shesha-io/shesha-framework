import { SettingsFormMarkupFactory } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  // Generate unique IDs for major components
  const commonTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
              .addSettingsInput({ inputType: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'showSizeChanger', label: 'Show Size Changer', size: 'small', jsSetting: true },
                { type: 'switch', propertyName: 'showTotalItems', label: 'Show Total Items', size: 'small', jsSetting: true },
              ] })
              .addPropertyRouter({ id: styleRouterId, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouterId)
                  .stdFontPanel(undefined, ['align'])
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
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
