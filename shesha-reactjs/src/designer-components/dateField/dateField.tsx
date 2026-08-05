import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { CalendarOutlined } from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { DatePickerWrapper } from './datePickerWrapper';
import { DateFieldDefinition, DateFieldValueType, DateSelectionType, IDateFieldProps, IDateFieldPropsV1, NoUndefinedRangeValueType } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { DateFieldApi } from '../../componentsApi/componentApi';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

/**
 * Folds the legacy `picker` + `showTime` pair into a single selection type. Time precision is not
 * recoverable from the old model (it only knew "show time or not"), so a time-bearing date picker
 * lands on minutes — the default the spreadsheet specifies.
 */
const toSelectionType = (picker: string | undefined, showTime: boolean | undefined): DateSelectionType => {
  switch (picker) {
    case 'week': return 'week';
    case 'month': return 'month';
    case 'quarter': return 'quarter';
    case 'year': return 'year';
    case 'time': return 'dateTimeMinutes';
    default: return showTime === true ? 'dateTimeMinutes' : 'date';
  }
};

const DateField: DateFieldDefinition = {
  allowInherit: true,
  type: 'dateField',
  name: 'Date field',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <CalendarOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.date || dataType === DataTypes.dateTime,
  Factory: ({ model, apiContext }) => {
    const componentApi = useComponentApi();
    const inputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      componentApi?.updateApi<DateFieldApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'DateFieldApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'isRange', getter: () => model.range === true, setter: (value) => apiContext?.updateApiModel({ range: value }) },
        ],
        api: { focus: () => inputRef.current?.querySelector('input')?.focus() },
      });
    }, [apiContext, componentApi, model.componentName, model.id, model.range]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    return (
      <ConfigurableFormItem<DateFieldValueType> model={model}>
        {(value, onChange, _, ctx) => {
          return (
            <DatePickerWrapper
              {...model}
              ref={inputRef}
              value={value}
              onChange={(newValue: string | NoUndefinedRangeValueType<string> | null, _dateString: string | [string, string] | null) => {
                ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
                onChange(newValue);
              }}
              {...getComponentEvents<DateFieldValueType>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.dateTime)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => ({
    ...model,
  }),
  getDefaultStyles: () => defaultStyles(),
  migrator: (m) => m
    .add<IDateFieldPropsV1>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDateFieldPropsV1>(1, (prev) => migrateVisibility(prev))
    .add<IDateFieldPropsV1>(2, (prev) => migrateReadOnly(prev))
    .add<IDateFieldPropsV1>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IDateFieldPropsV1>(4, (prev) => ({
      ...prev,
      showNow: prev.showNow === true || prev.showToday === true,
    }))
    .add<IDateFieldPropsV1>(5, (prev, context) => {
      if (context.isNew === true) return prev;

      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        style: prev.style,
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IDateFieldPropsV1>(6, (prev, context) => {
      if (context.isNew === true) return prev;

      const styles: IInputStyles = {
        size: prev.size,
        width: prev.width,
        height: prev.height,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        fontSize: prev.fontSize,
        fontColor: prev.fontColor,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox,
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IDateFieldPropsV1>(7, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IDateFieldProps>(8, (prev) => {
      const model = { ...migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev)) } as IDateFieldProps;
      const legacy = prev as IDateFieldPropsV1;

      // picker + showTime -> selectionType
      model.selectionType = legacy.selectionType ?? toSelectionType(legacy.picker, legacy.showTime);

      // resolveToUTC -> bindingFormat. The old boolean only distinguished UTC from local ISO.
      model.bindingFormat = prev.bindingFormat ?? (prev.resolveToUTC === true ? 'utc' : 'isoLocal');

      // disabledDateMode/template -> dateRestriction, where the old config maps cleanly. A custom
      // function has no dropdown equivalent, so it stays on the legacy properties and keeps working.
      if (prev.disabledDateMode === 'functionTemplate') {
        model.dateRestriction = prev.disabledDateTemplate?.includes('<') === true ? 'past' : 'future';
      } else if (prev.disabledDateMode === 'none' || prev.disabledDateMode === undefined) {
        model.dateRestriction = 'none';
      }

      return model;
    }),
  linkToModelMetadata: (model, metadata): IDateFieldProps => {
    return {
      ...model,
      dateFormat: isNotNullOrWhiteSpace(metadata.dataFormat) ? metadata.dataFormat : model.dateFormat,
      selectionType: model.selectionType ?? (metadata.dataType === DataTypes.dateTime
        ? 'dateTimeMinutes'
        : metadata.dataType === DataTypes.date
          ? 'date'
          : model.selectionType),
    };
  },
  previewConfiguration: {
    type: 'dateField',
    id: 'dateField',
    propertyName: `dateFieldAppearance`,
    label: `Date Field Label`,
    version: 'latest',
    selectionType: 'dateTimeMinutes',
  },
};

export default DateField;
