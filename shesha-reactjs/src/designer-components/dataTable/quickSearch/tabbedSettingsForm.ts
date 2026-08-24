import { SettingsFormMarkupFactory } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const commonTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true })
              .addPropertyRouter({ id: styleRouterId, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouterId).stdDimensionsPanel(undefined, ['height', 'minHeight', 'maxHeight']).toJson(),
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
