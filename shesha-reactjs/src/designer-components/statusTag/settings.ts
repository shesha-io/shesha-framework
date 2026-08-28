import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { presetColors } from '../dropdown/utils';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { STATUS_TAG_EVENTS } from './events';

const refListHiddenJs = "return getSettingValue(data.dataSourceType) !== 'referenceList';";
const valuesVisibleJs = "return getSettingValue(data.dataSourceType) === 'values';";
const refListVisibleJs = "return getSettingValue(data.dataSourceType) === 'referenceList';";
// Disabled values needs both a reference list and the Disable Item Value toggle.
const disabledValuesHiddenOrNotRefListJs = "return getSettingValue(data.dataSourceType) !== 'referenceList' || !getSettingValue(data.disableItemValue);";

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const commonStyleRouterId = nanoid();

  const dataSourceTypeOptions = [
    { value: 'referenceList', label: 'Reference list' },
    { value: 'values', label: 'Values' },
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
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
                /* Visible only. The status tag is a display component, so Interaction Mode has
                   nothing to switch between — see the note in `statusTag.tsx`. Permissions still
                   ride on this input, which is where the migrated `permissions` land. */
                .addSettingsInputRow({
                  inputs: [
                    { type: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true },
                  ],
                })
                .addSettingsInput({
                  inputType: 'textField', propertyName: 'readOnlyPlaceholder', label: 'Read-only Placeholder', size: 'small', jsSetting: true,
                  tooltip: 'Text that gets displayed when the bound property has no value.',
                })
                .addSettingsInput({ inputType: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true })
                .addSettingsInput({ inputType: 'switch', propertyName: 'enableMultiSelect', label: 'Enable Multi-Select', size: 'small', layout: 'horizontal', jsSetting: true })
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'dataSourceType', label: 'Data source', size: 'small', jsSetting: true,
                  dropdownOptions: dataSourceTypeOptions,
                  validate: { required: true },
                  tooltip: 'Where the statuses come from. A reference list is the usual source; Values lets you define them inline on the form.',
                })
                .addSettingsInput({
                  inputType: 'referenceListAutocomplete', propertyName: 'referenceListId', label: 'Reference List', isDynamic: true,
                  /* Mandatory per the spec, but only while it is the selected source — a required
                     input that is hidden under Values would block the form with an error the user
                     cannot see or clear. */
                  validate: { required: true },
                  visibleJs: refListVisibleJs,
                })
                /* Filter / Disabled values / Hidden values, behind the same collapsible 'Advanced'
                   affordance the spec describes, shown only for a reference list. */
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
                  }), true, refListVisibleJs)
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
                .addSettingsInputRow({
                  inputs: [
                    { type: 'switch', propertyName: 'showItemName', label: 'Show Label', jsSetting: true, tooltip: 'When checked the DisplayName/RefList Name will be shown.', layout: 'horizontal' },
                    { type: 'switch', propertyName: 'showIcon', label: 'Show Icon', size: 'small', jsSetting: true, tooltip: 'When checked the icon will display on the left side of the DisplayName' },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers([...STATUS_TAG_EVENTS], DataTypes.array).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [
              ...fbf(appearanceTabId)
                .addPropertyRouter({
                  id: commonStyleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                  propertyRouteName: removeStyleRouter === true ? '' : { _mode: 'code', _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: '' },
                  components: [
                    ...fbf(commonStyleRouterId)
                      .stdFontPanel('font', ['align'])
                      .stdDimensionsPanel('dimensions')
                      .stdBorderPanel(removeStyleRouter !== true, 'border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'background')
                      .stdShadowPanel('shadow')
                      .stdMarginPaddingPanel('stylingBoxJson')
                      .stdCustomStylePanel('style')
                      /* The tag is the component, so its own styles are always relevant — unlike
                         the dropdown, which hides this panel when it renders plain text. */
                      .stdCollapsiblePanel('Tag Style', (f) => f
                        .addSettingsInput({
                          inputType: 'dropdown', propertyName: 'tagVariant', label: 'Variant', size: 'small', jsSetting: true,
                          dropdownOptions: tagVariantOptions,
                          tooltip: 'How each tag is filled when the status carries its own colour. Solid fills the tag, Outlined draws a coloured border, Filled applies a soft tint.',
                        })
                        .stdFontPanel('tag.font')
                        .stdDimensionsPanel('tag.dimensions')
                        .stdBorderPanel(removeStyleRouter !== true, 'tag.border', 'radius')
                        .stdBackgroundPanel(removeStyleRouter !== true, 'tag.background')
                        .stdShadowPanel('tag.shadow')
                        .stdMarginPaddingPanel('tag.stylingBoxJson')
                        /* Must name the nested property: a bare `stdCustomStylePanel()` defaults to
                           'style' and would silently bind to the same property as the root panel. */
                        .stdCustomStylePanel('tag.style'))
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
