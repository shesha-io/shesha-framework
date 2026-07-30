import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { presetColors } from './utils';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';

const refListHiddenJs = "return getSettingValue(data.dataSourceType) !== 'referenceList';";
const valuesVisibleJs = "return getSettingValue(data.dataSourceType) === 'values';";
const customValueHiddenJs = "return getSettingValue(data?.valueFormat) !== 'custom';";
const disabledValuesHiddenJs = "return !getSettingValue(data.disableItemValue);";
const tagsVisibleJs = 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags";';
const tagsHiddenJs = 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) !== "tags";';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const tagRouterId = nanoid();
  const tagPanelId = nanoid();

  const modeOptions = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
  ];
  const dataSourceTypeOptions = [
    { value: 'values', label: 'Values' },
    { value: 'referenceList', label: 'Reference list' },
  ];
  const valueFormatOptions = [
    { value: 'simple', label: 'Simple item value' },
    { value: 'listItem', label: 'Reference list item' },
    { value: 'custom', label: 'Custom' },
  ];
  const displayStyleOptions = [
    { value: 'text', label: 'Plain text' },
    { value: 'tags', label: 'Tags' },
  ];

  const json = {
    components: fbf('root')
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .stdPlaceholderDescriptionInputs()
                .stdVisibleEditableInputs('full')
                .stdCollapsiblePanel('Data', (fb) => fb
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'dropdown', propertyName: 'mode', label: 'Mode', size: 'small', jsSetting: true, dropdownOptions: modeOptions },
                      { type: 'dropdown', propertyName: 'dataSourceType', label: 'Data Source Type', size: 'small', jsSetting: true, dropdownOptions: dataSourceTypeOptions },
                    ],
                  })
                  .addSettingsInputRow({
                    visibleJs: tagsVisibleJs,
                    inputs: [
                      { type: 'switch', propertyName: 'showItemName', label: 'Show Item Name', jsSetting: true, tooltip: 'When checked the DisplayName/RefList Name will be shown.', layout: 'horizontal' },
                      { type: 'switch', propertyName: 'showIcon', label: 'Show Icon', size: 'small', jsSetting: true, tooltip: 'When checked the icon will display on the left side of the DisplayName' },
                    ],
                  })
                  .addSettingsInputRow({
                    visibleJs: valuesVisibleJs,
                    inputs: [
                      {
                        type: 'customLabelValueEditor', propertyName: 'values', jsSetting: true, label: 'Values',
                        labelName: 'label', labelTitle: 'Label', colorName: 'color', colorTitle: 'Color', iconName: 'icon', iconTitle: 'Icon',
                        mode: 'inline', valueName: 'value', valueTitle: 'Value', dropdownOptions: presetColors,
                      },
                    ],
                  })
                  .addSettingsInput({ inputType: 'referenceListAutocomplete', propertyName: 'referenceListId', label: 'Reference List', isDynamic: true, visibleJs: valuesVisibleJs.replace("===", "!==") })
                  .addSettingsInput({ inputType: 'queryBuilder', propertyName: 'filter', label: 'Items Filter', isDynamic: true, validate: {}, modelType: 'Shesha.Framework.ReferenceListItem', hidden: { _code: refListHiddenJs, _mode: 'code', _value: false } })
                  .addSettingsInput({ inputType: 'dropdown', propertyName: 'valueFormat', label: 'Value Format', size: 'small', jsSetting: true, dropdownOptions: valueFormatOptions, hidden: { _code: refListHiddenJs, _mode: 'code', _value: false } })
                  .addSettingsInputRow({
                    hidden: { _code: refListHiddenJs, _mode: 'code', _value: false },
                    inputs: [
                      { type: 'codeEditor', propertyName: 'incomeCustomJs', label: 'Key Value', labelAlign: 'right', tooltip: 'Return key from the value', hidden: { _code: customValueHiddenJs, _mode: 'code', _value: false } },
                      { type: 'codeEditor', propertyName: 'outcomeCustomJs', label: 'Custom Value', labelAlign: 'right', tooltip: 'Return value that will be stored as field value', hidden: { _code: customValueHiddenJs, _mode: 'code', _value: false } },
                    ],
                  })
                  .addSettingsInputRow({
                    hidden: { _code: refListHiddenJs, _mode: 'code', _value: false },
                    inputs: [
                      { type: 'codeEditor', propertyName: 'labelCustomJs', label: 'Item Custom Label', labelAlign: 'right', tooltip: 'Return label value' },
                      { type: 'switch', propertyName: 'disableItemValue', tooltip: 'Disable reference list from selection', label: 'Disable Item Value', jsSetting: true, layout: 'horizontal' },
                    ],
                  })
                  .addSettingsInput({
                    inputType: 'textArea', propertyName: 'disabledValues', label: 'Disabled Values', allowClear: true, jsSetting: true,
                    tooltip: 'Pass an array of positive integers to disable specific values. For example: [1, 2, 3].',
                    hidden: { _code: disabledValuesHiddenJs, _mode: 'code', _value: false },
                  })
                  .addSettingsInput({
                    inputType: 'textArea', propertyName: 'ignoredValues', label: 'Ignored Values', allowClear: true, jsSetting: true,
                    tooltip: 'Pass an array of positive integers to ignore specific values. For example: [1, 2, 3].',
                    hidden: { _code: refListHiddenJs, _mode: 'code', _value: false },
                  }))
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers(['onChange'], DataTypes.array).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [
              ...fbf(appearanceTabId)
                .addSettingsInput({ inputType: 'dropdown', propertyName: 'displayStyle', label: 'Display Style', dropdownOptions: displayStyleOptions })
                .stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter)
                .addPropertyRouter({
                  id: tagRouterId,
                  propertyName: 'dropdownTagRouter',
                  componentName: 'dropdownTagRouter',
                  label: 'Tag styles router',
                  labelAlign: 'right',
                  hidden: false,
                  propertyRouteName: { _mode: 'code', _code: `return ${removeStyleRouter === true ? '' : 'contexts.canvasContext?.designerDevice || "desktop"'};`, _value: '' },
                  components: [
                    ...fbf(tagRouterId)
                      .addCollapsiblePanel({
                        id: tagPanelId,
                        propertyName: 'defaultTagStyle',
                        label: 'Custom Tag Styles',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        hidden: { _code: tagsHiddenJs, _mode: 'code', _value: false },
                        content: {
                          id: nanoid(),
                          components: [
                            ...fbf(tagPanelId)
                              .addSettingsInput({ inputType: 'switch', propertyName: 'solidColor', label: 'Show Solid Color', size: 'small', tooltip: 'When checked solid color fills the entire background, when unchecked creates a subtle light background with a prominent colored border.' })
                              .stdFontPanel('tag.font')
                              .stdDimensionsPanel('tag.dimensions')
                              .stdBorderPanel(true, 'tag.border')
                              .stdBackgroundPanel(true, 'tag.background')
                              .stdShadowPanel('tag.shadow')
                              .stdCustomStylePanel('tag.style')
                              .toJson(),
                          ],
                        },
                      })
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
