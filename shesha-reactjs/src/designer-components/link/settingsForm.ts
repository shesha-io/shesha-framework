import { FormLayout } from 'antd/es/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

const justifyContentOptions = [
  { label: 'Center', value: 'center' }, { label: 'Flex Start', value: 'flex-start' }, { label: 'Flex End', value: 'flex-end' },
  { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }, { label: 'Space Between', value: 'space-between' },
  { label: 'Space Around', value: 'space-around' }, { label: 'Space Evenly', value: 'space-evenly' }, { label: 'Stretch', value: 'stretch' },
];

const alignItemsOptions = [
  { label: 'Baseline', value: 'baseline' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'end' },
  { label: 'Flex End', value: 'flex-end' }, { label: 'Flex Start', value: 'flex-start' }, { label: 'Inherit', value: 'inherit' },
  { label: 'Initial', value: 'initial' }, { label: 'Normal', value: 'normal' }, { label: 'Revert', value: 'revert' },
  { label: 'Self End', value: 'self-end' }, { label: 'Self Start', value: 'self-start' }, { label: 'Start', value: 'start' },
  { label: 'Stretch', value: 'stretch' }, { label: 'Unset', value: 'unset' },
];

const justifyItemsOptions = [
  { label: 'Baseline', value: 'baseline' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'end' },
  { label: 'Flex End', value: 'flex-end' }, { label: 'Flex Start', value: 'flex-start' }, { label: 'inherit', value: 'inherit' },
  { label: 'Initial', value: 'initial' }, { label: 'Left', value: 'left' }, { label: 'Legacy', value: 'legacy' },
  { label: 'Normal', value: 'normal' }, { label: 'Revert', value: 'revert' }, { label: 'Right', value: 'right' },
  { label: 'Self End', value: 'self-end' }, { label: 'Self Start', value: 'self-start' }, { label: 'Start', value: 'start' },
  { label: 'Stretch', value: 'stretch' }, { label: 'Unset', value: 'unset' },
];

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouter1Id = nanoid();
  const styleRouter2Id = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true },
                { type: 'switch', propertyName: 'hasChildren', label: 'Custom Link', size: 'small', jsSetting: true },
              ] })
              .addSettingsInput({ inputType: 'textArea', propertyName: 'content', label: 'Content', size: 'small', jsSetting: true, visibleJs: 'return !getSettingValue(data?.hasChildren);' })
              .addSettingsInput({ inputType: 'textField', propertyName: 'href', label: 'URL', size: 'small', jsSetting: true })
              .addSettingsInput({ inputType: 'dropdown', propertyName: 'target', label: 'Target', size: 'small', validate: { required: true }, jsSetting: true,
                dropdownOptions: [{ label: 'Blank', value: '_blank' }, { label: 'Parent', value: '_parent' }, { label: 'Self', value: '_self' }, { label: 'Top', value: '_top' }],
              })
              .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
              .addSettingsInput({ visibleJs: 'return getSettingValue(data?.hasChildren) === true;',
                inputType: 'dropdown', propertyName: 'direction', label: 'Direction', jsSetting: true, layout: 'horizontal',
                dropdownOptions: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }],
              })
              .addPropertyRouter({ id: styleRouter1Id, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter1Id)
                  .stdCollapsiblePanel('Layout', (fbf) => fbf
                    .addSettingsInputRow({ inputs: [
                      { type: 'dropdown', propertyName: 'justifyContent', label: 'Justify Content', jsSetting: true, layout: 'horizontal', dropdownOptions: justifyContentOptions },
                      { type: 'dropdown', propertyName: 'alignItems', label: 'Align Items', jsSetting: true, layout: 'horizontal', dropdownOptions: alignItemsOptions },
                      { type: 'dropdown', propertyName: 'justifyItems', label: 'Justify Items', jsSetting: true, layout: 'horizontal', dropdownOptions: justifyItemsOptions },
                    ] }),
                  false,
                  'return getSettingValue(data?.hasChildren) === true && getSettingValue(data?.direction) === "horizontal"',
                  )
                  .stdContainer((fbf) => fbf.stdFontPanel(), 'return !getSettingValue(data?.hasChildren);')
                  .stdDimensionsPanel()
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Custom Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                  .toJson(),
              })

              .toJson(),
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addSettingsInput({ visibleJs: 'return getSettingValue(data?.hasChildren) === true;',
                inputType: 'dropdown', propertyName: 'direction', label: 'Direction', jsSetting: true, layout: 'horizontal',
                dropdownOptions: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }],
              })
              .addPropertyRouter({ id: styleRouter2Id, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter2Id)
                  .stdCollapsiblePanel('Layout', (fbf) => fbf
                    .addSettingsInputRow({ inputs: [
                      { type: 'dropdown', propertyName: 'justifyContent', label: 'Justify Content', jsSetting: true, layout: 'horizontal', dropdownOptions: justifyContentOptions },
                      { type: 'dropdown', propertyName: 'alignItems', label: 'Align Items', jsSetting: true, layout: 'horizontal', dropdownOptions: alignItemsOptions },
                      { type: 'dropdown', propertyName: 'justifyItems', label: 'Justify Items', jsSetting: true, layout: 'horizontal', dropdownOptions: justifyItemsOptions },
                      { type: 'textField', propertyName: 'className', label: 'Custom CSS Class', jsSetting: true },
                    ] }),
                  false,
                  'return getSettingValue(data?.hasChildren) === true && getSettingValue(data?.direction) === "horizontal"',
                  )
                  .stdContainer((fbf) => fbf.stdFontPanel(), 'return !getSettingValue(data?.hasChildren);')
                  .stdDimensionsPanel()
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Custom Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                  .toJson(),
              })
              .toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
