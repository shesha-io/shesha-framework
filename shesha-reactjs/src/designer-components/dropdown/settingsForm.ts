import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { presetColors } from './utils';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

const refListHiddenJs = "return getSettingValue(data.dataSourceType) !== 'referenceList';";
const valuesVisibleJs = "return getSettingValue(data.dataSourceType) === 'values';";
const refListVisibleJs = "return getSettingValue(data.dataSourceType) === 'referenceList';";
const customValueHiddenJs = "return getSettingValue(data?.valueFormat) !== 'custom';";
// Disabled values needs both a reference list and the Disable Item Value toggle.
const disabledValuesHiddenOrNotRefListJs = "return getSettingValue(data.dataSourceType) !== 'referenceList' || !getSettingValue(data.disableItemValue);";
const tagsVisibleJs = 'return getSettingValue(data?.displayStyle) === "tags";';
const tagsHiddenJs = 'return getSettingValue(data?.displayStyle) !== "tags";';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const commonStyleRouterId = nanoid();

  const dataSourceTypeOptions = [
    { value: 'values', label: 'Values' },
    { value: 'referenceList', label: 'Reference list' },
  ];
  const bindingFormatOptions = [
    { value: 'itemValue', label: 'Item Value' },
    { value: 'itemLabel', label: 'Item Label' },
  ];
  const displayStyleOptions = [
    { value: 'text', label: 'Plain text' },
    { value: 'tags', label: 'Tags' },
  ];
  const tagVariantOptions = [
    { value: 'solid', label: 'Solid' },
    { value: 'outlined', label: 'Outlined' },
    { value: 'filled', label: 'Filled' },
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
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true } })
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'bindingFormat', label: 'Binding Format', size: 'small', jsSetting: true,
                  dropdownOptions: bindingFormatOptions,
                  tooltip: 'Specifies whether binding should be to the selected item value or the selected item label (e.g. if you want to save this selected item text to a string property).',
                })
                .stdVisibleEditableInputs('full')
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .stdPlaceholderDescriptionInputs()
                .addSettingsInput({
                  inputType: 'textField', propertyName: 'readOnlyPlaceholder', label: 'Read-only Placeholder', size: 'small', jsSetting: true,
                  tooltip: 'Text that gets displayed when empty and in read-only mode.',
                })
                .addSettingsInput({ inputType: 'dropdown', propertyName: 'displayStyle', label: 'Style', dropdownOptions: displayStyleOptions })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'switch', propertyName: 'showItemName', label: 'Show Item Name', jsSetting: true, tooltip: 'When checked the DisplayName/RefList Name will be shown.', layout: 'horizontal' },
                    { type: 'switch', propertyName: 'showIcon', label: 'Show Icon', size: 'small', jsSetting: true, tooltip: 'When checked the icon will display on the left side of the DisplayName' },
                  ],
                  hidden: { _code: tagsHiddenJs, _mode: 'code', _value: false },
                  visibleJs: tagsVisibleJs,
                })
                .addSettingsInput({ inputType: 'switch', propertyName: 'enableMultiSelect', label: 'Enable Multi-Select', size: 'small', layout: 'horizontal', jsSetting: true })
                .addSettingsInput({ inputType: 'dropdown', propertyName: 'dataSourceType', label: 'Data source', size: 'small', jsSetting: true, dropdownOptions: dataSourceTypeOptions })
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
                .addSettingsInput({ inputType: 'referenceListAutocomplete', propertyName: 'referenceListId', label: 'Reference List', isDynamic: true, validate: { required: true }, visibleJs: refListVisibleJs })
                .stdCollapsiblePanel('Advanced', (fb) => fb
                  .addSettingsInput({ inputType: 'queryBuilder', propertyName: 'filter', label: 'Filter', isDynamic: true, validate: {}, modelType: 'Shesha.Framework.ReferenceListItem', hidden: { _code: refListHiddenJs, _mode: 'code', _value: false } })
                  .addSettingsInput({ inputType: 'switch', propertyName: 'disableItemValue', tooltip: 'Disable reference list from selection', label: 'Disable Item Value', jsSetting: true, layout: 'horizontal', hidden: { _code: refListHiddenJs, _mode: 'code', _value: false } })
                  .addSettingsInput({
                    inputType: 'textArea', propertyName: 'disabledValues', label: 'Disabled values', allowClear: true, jsSetting: true,
                    tooltip: 'Pass an array of positive integers to disable specific values. For example: [1, 2, 3].',
                    hidden: { _code: disabledValuesHiddenOrNotRefListJs, _mode: 'code', _value: false },
                  })
                  .addSettingsInput({
                    inputType: 'textArea', propertyName: 'ignoredValues', label: 'Hidden values', allowClear: true, jsSetting: true,
                    tooltip: 'Pass an array of positive integers to hide specific values. For example: [1, 2, 3].',
                    hidden: { _code: refListHiddenJs, _mode: 'code', _value: false },
                  })
                  .addSettingsInputRow({
                    hidden: { _code: customValueHiddenJs, _mode: 'code', _value: false },
                    inputs: [
                      { type: 'codeEditor', propertyName: 'incomeCustomJs', label: 'Key Value (legacy)', labelAlign: 'right', tooltip: 'Return key from the value. Legacy setting, retained for forms saved with the removed Custom value format.' },
                      { type: 'codeEditor', propertyName: 'outcomeCustomJs', label: 'Custom Value (legacy)', labelAlign: 'right', tooltip: 'Return value that will be stored as field value. Legacy setting, retained for forms saved with the removed Custom value format.' },
                    ],
                  }), true)
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'textField', propertyName: 'validate.message', label: 'Message', size: 'small', jsSetting: true },
                      { type: 'codeEditor', propertyName: 'validate.validator', label: 'Custom Validation', labelAlign: 'right', tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise' },
                    ],
                  }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers([...ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK], DataTypes.array).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [
              ...fbf(appearanceTabId)
                .addPropertyRouter({ id: commonStyleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                  propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                  components: [
                    ...fbf(commonStyleRouterId)
                      .stdFontPanel('font', ['align'])
                      .stdDimensionsPanel('dimensions')
                      .stdBorderPanel(removeStyleRouter !== true, 'border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'background')
                      .stdShadowPanel('shadow')
                      .stdMarginPaddingPanel('stylingBoxJson')
                      .stdCustomStylePanel('style')
                      .stdCollapsiblePanel('Tag Style', (f) => f
                        .addSettingsInput({
                          inputType: 'dropdown', propertyName: 'tagVariant', label: 'Variant', size: 'small', jsSetting: true,
                          dropdownOptions: tagVariantOptions,
                          tooltip: 'How each tag is filled when the option carries its own colour. Solid fills the tag, Outlined draws a coloured border, Filled applies a soft tint.',
                        })
                        .stdFontPanel('tag.font')
                        .stdDimensionsPanel('tag.dimensions')
                        .stdBorderPanel(removeStyleRouter !== true, 'tag.border', 'radius')
                        .stdBackgroundPanel(removeStyleRouter !== true, 'tag.background')
                        .stdShadowPanel('tag.shadow')
                        .stdMarginPaddingPanel('tag.stylingBoxJson')
                        .stdCustomStylePanel('tag.style'),
                      true,
                      /* Plain text hands antd the raw label, so nothing in this panel reaches the
                         DOM — hidden rather than left inert, like Show Item Name / Show Icon. */
                      tagsVisibleJs,
                      )
                      .toJson()],
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
