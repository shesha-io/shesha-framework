import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

/* On Change exposes `dateString` in addition to the standard constants: the value as displayed,
   formatted with the configured Date/Time Format. For a range it is a [start, end] pair. */
const onChangeConstantsExpression = [
  'return metadataBuilder.object("constants")',
  '.addAllStandard()',
  '.addObject("event", "Event callback when user input", undefined)',
  '.addString("dateString", "Selected date as displayed, formatted with the configured Date/Time Format")',
  '.add("date-time", "value", "Component current value")',
  '.build();',
].join('\r\n');

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const bindingFormatOptions = [
    { value: 'utc', label: 'UTC' },
    { value: 'isoLocal', label: 'ISO Local' },
    { value: 'isoOffset', label: 'ISO with offset' },
    { value: 'dateOnly', label: 'Date only' },
    { value: 'ticks', label: 'Ticks' },
    { value: 'unix', label: 'Unix' },
  ];

  const selectionTypeOptions = [
    { value: 'dateTimeHours', label: 'Date & Time (hours)' },
    { value: 'dateTimeMinutes', label: 'Date & Time (mins)' },
    { value: 'dateTimeSeconds', label: 'Date & Time (secs)' },
    { value: 'date', label: 'Date only' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ];

  const minuteStepOptions = [
    { value: 1, label: '1 Minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' },
  ];

  const dateRestrictionOptions = [
    { value: 'none', label: 'None' },
    { value: 'past', label: 'In the past' },
    { value: 'future', label: 'In the future' },
  ];

  const timeRestrictionOptions = [
    { value: 'none', label: 'None' },
    { value: 'timeFunctionTemplate', label: 'Function template' },
    { value: 'customTimeFunction', label: 'Custom function' },
  ];

  const timeRestrictionTemplateOptions = [
    { value: 'disabledPastTime', label: 'Disable past times' },
    { value: 'disabledFutureTime', label: 'Disable future times' },
  ];

  // Selection types that carry a time part — drives Time Format / Minute steps / Time Restrictions.
  const isDateTimeJs = 'return ["dateTimeHours", "dateTimeMinutes", "dateTimeSeconds"].includes(getSettingValue(data?.selectionType) ?? "dateTimeMinutes");';
  // Minute steps only make sense once minutes are actually shown.
  const hasMinutesJs = 'return ["dateTimeMinutes", "dateTimeSeconds"].includes(getSettingValue(data?.selectionType) ?? "dateTimeMinutes");';
  // Converting to/from UTC only means anything when a time of day is stored and the value is
  // actually persisted as UTC — a calendar unit (week/month/quarter/year) or a bare date would just
  // be shifted across a day boundary by the conversion.
  // Deliberately reads only bindingFormat, never resolveToUTC: a switch whose visibility depends on
  // its own value can be switched off but never back on. Migrator step 8 always writes bindingFormat,
  // so there is no saved markup where the old boolean is the only thing left to read.
  const isUtcConvertibleJs = 'return getSettingValue(data?.bindingFormat) === "utc" && ["dateTimeHours", "dateTimeMinutes", "dateTimeSeconds"].includes(getSettingValue(data?.selectionType) ?? "dateTimeMinutes");';
  // Date Format applies to every selection except the calendar-unit pickers, which have their own.
  const isDateBasedJs = 'return !["week", "month", "quarter", "year"].includes(getSettingValue(data?.selectionType) ?? "dateTimeMinutes");';
  // Inverse of the above: hides the whole row rather than leaving an empty one behind when only the
  // per-input conditions match, since exactly one of its four fields can ever apply.
  const isCalendarUnitJs = 'return ["week", "month", "quarter", "year"].includes(getSettingValue(data?.selectionType) ?? "dateTimeMinutes");';

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
                .addContextPropertyAutocomplete({
                  propertyName: 'toPropertyName', label: 'To Property Name', styledLabel: true, size: 'small',
                  description: 'Property the end of the range binds to. Only used when Range is enabled.',
                  hidden: { _code: 'return !getSettingValue(data?.range);', _mode: 'code', _value: false },
                })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'bindingFormat', label: 'Binding Format', size: 'small', jsSetting: true,
                  tooltip: 'Format the selected value is stored in.',
                  dropdownOptions: bindingFormatOptions,
                })
                .stdVisibleEditableInputs('full')
                .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                .stdPlaceholderDescriptionInputs()
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'selectionType', label: 'Selection Type', size: 'small', jsSetting: true,
                  tooltip: 'What the user picks, and at what precision.',
                  dropdownOptions: selectionTypeOptions,
                })
                .addSettingsInput({ inputType: 'switch', propertyName: 'range', label: 'Range', size: 'small', layout: 'horizontal', jsSetting: true })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'textField', propertyName: 'dateFormat', label: 'Date Format', size: 'small', jsSetting: true },
                    { type: 'textField', propertyName: 'timeFormat', label: 'Time Format', size: 'small', jsSetting: true, visibleJs: isDateTimeJs },
                  ],
                  visibleJs: isDateBasedJs,
                })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'textField', propertyName: 'weekFormat', label: 'Week Format', size: 'small', jsSetting: true, visibleJs: 'return getSettingValue(data?.selectionType) === "week";' },
                    { type: 'textField', propertyName: 'monthFormat', label: 'Month Format', size: 'small', jsSetting: true, visibleJs: 'return getSettingValue(data?.selectionType) === "month";' },
                    { type: 'textField', propertyName: 'quarterFormat', label: 'Quarter Format', size: 'small', jsSetting: true, visibleJs: 'return getSettingValue(data?.selectionType) === "quarter";' },
                    { type: 'textField', propertyName: 'yearFormat', label: 'Year Format', size: 'small', jsSetting: true, visibleJs: 'return getSettingValue(data?.selectionType) === "year";' },
                  ],
                  visibleJs: isCalendarUnitJs,
                })
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'minuteStep', label: 'Minute steps', size: 'small', jsSetting: true,
                  tooltip: 'Granularity of the minute column in the time picker.',
                  dropdownOptions: minuteStepOptions,
                  visibleJs: hasMinutesJs,
                })
                .addSettingsInput({ inputType: 'switch', propertyName: 'resolveToUTC', label: 'Convert to/from UTC', size: 'small', layout: 'horizontal', jsSetting: true, visibleJs: isUtcConvertibleJs })
                .addSettingsInput({ inputType: 'switch', propertyName: 'defaultToMidnight', label: 'Default time to midnight', size: 'small', layout: 'horizontal', jsSetting: true, visibleJs: isDateTimeJs })
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'dateRestriction', label: 'Date Restriction', size: 'small', jsSetting: true,
                  dropdownOptions: dateRestrictionOptions,
                })
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'disabledTimeMode', label: 'Time Restrictions', size: 'small', jsSetting: true,
                  dropdownOptions: timeRestrictionOptions,
                  visibleJs: isDateTimeJs,
                })
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'disabledTimeTemplate', label: 'Time Restriction Template', size: 'small', jsSetting: true,
                  dropdownOptions: timeRestrictionTemplateOptions,
                  hidden: { _code: 'return getSettingValue(data?.disabledTimeMode) !== "timeFunctionTemplate";', _mode: 'code', _value: false },
                })
                .addSettingsInput({
                  inputType: 'codeEditor', propertyName: 'disabledTimeFunc', label: 'Time Restriction Func',
                  hidden: { _code: 'return getSettingValue(data?.disabledTimeMode) !== "customTimeFunction";', _mode: 'code', _value: false },
                })
                .stdCollapsiblePanel('Validations', (fb) => fb
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
            components: [
              ...fbf(eventsTabId)
                /* On Change is registered on its own so its constants can declare `dateString` — the
                   value as displayed, which the shared event config has no way to express. The
                   remaining events come from the shared helper unchanged. */
                .stdEventHandler(
                  'onChangeCustom', 'On Change', 'Enter the data change event handling code',
                  onChangeConstantsExpression,
                )
                .stdEventHandlers(
                  ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK.filter((event) => event !== 'onChange'),
                  DataTypes.dateTime,
                )
                .toJson(),
            ],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter).toJson()],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
