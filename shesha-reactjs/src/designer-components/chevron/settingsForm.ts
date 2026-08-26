import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/es/form/Form';
import { SettingsFormMarkupFactory } from '@/interfaces';

const commonTabId = nanoid();
const appearanceTabId = nanoid();
const styleRouterId = nanoid();

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', size: 'small', validate: { required: true }, styledLabel: true })
              .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
              .addSettingsInput({ inputType: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true })
              .addSettingsInput({ inputType: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true })
              .stdCollapsiblePanel('Data', (fbf) => fbf
                .addSettingsInput({ inputType: 'referenceListAutocomplete', propertyName: 'referenceList', label: 'Reference List', filter: { and: [{ '==': [{ var: 'isLast' }, true] }] },
                  tooltip: 'The reference list whose items are rendered as steps. Changes to its items are picked up automatically',
                })
                .addSettingsInput({ propertyName: 'items', inputType: 'RefListItemSelectorSettingsModal', label: 'Items', labelAlign: 'right',
                  referenceList: { _code: 'return getSettingValue(data?.referenceList);', _mode: 'code' },
                }))
              .toJson(),
          },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouterId, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouterId)
                  .stdFontPanel()
                  .stdCollapsiblePanel('Dimensions', (fbf) => fbf
                    .addSettingsInputRow({ inline: true, inputs: [
                      { type: 'dimensionField', dimensionType: 'width', label: 'Width', width: 85, propertyName: 'width', tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit' },
                      { type: 'dimensionField', dimensionType: 'height', label: 'Height', width: 85, propertyName: 'height', tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit' },
                    ] }))
                  .stdMarginPaddingPanel()
                  .stdCollapsiblePanel('Color Settings', (fbf) => fbf
                    .addSettingsInput({ propertyName: 'colorSource', label: 'Color Source', inputType: 'dropdown', jsSetting: true,
                      dropdownOptions: [{ value: 'primary', label: 'Primary color' }, { value: 'custom', label: 'Custom color' }, { value: 'reflist', label: 'From reflist item' }],
                    })
                    .addSettingsInput({ propertyName: 'activeColor', label: 'Active Color', inputType: 'colorPicker', jsSetting: true,
                      visibleJs: 'return  getSettingValue(data?.colorSource) === "custom";',
                    })
                    .addSettingsInput({ propertyName: 'showIcons', label: 'Show Icons', inputType: 'switch', jsSetting: true }))
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
