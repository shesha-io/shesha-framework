import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import RadioGroup, { useRadioOptions } from './radioGroup';
import { CSSProperties, useEffect, useRef } from 'react';
import { useActualContextExecution } from '@/hooks';
import { CheckCircleOutlined } from '@ant-design/icons';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers/form/models';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import {
  migrateCustomFunctions,
  migrateHiddenToVisible,
  migratePropertyName,
  migrateReadOnly,
  migrateStylingBoxToJson,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migrateStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';
import { DIRECTION_TYPE, DirectionType, IRadioComponentProps, RadioComponentDefinition } from './interfaces';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { DATA_SOURCE_TYPES, DataSourceType } from '../dropdown/model';
import { getStringEnumOrDefault } from '@/utils/object';
import { getNumberOrUndefined } from '@/utils/string';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { useComponentApi } from '@/providers/componentApi/provider';
import { RadioApi } from '@/componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const RadioComponent: RadioComponentDefinition = {
  allowInherit: true,
  type: 'radio',
  name: 'Radio',
  icon: <CheckCircleOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  // Radio has its own intrinsic size and should not be forced to fill wrapper
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.referenceListItem || (dataType === DataTypes.array && dataFormat === ArrayFormats.simple),
  // `dataSourceUrl` is a script (it may read form data, localStorage, etc.), so evaluate it
  // here and resolve the options against the endpoint it returns.
  calculateModel: (model, allData) => ({
    dataSourceUrl: isNotNullOrWhiteSpace(model.dataSourceUrl)
      ? executeScriptSync<string>(model.dataSourceUrl, allData)
      : model.dataSourceUrl,
  }),
  Factory: ({ model, calculatedModel }) => {
    // The wrapper's own custom style is evaluated by the framework and applied inline as
    // `styleJson`. A nested set gets no such treatment, so the per-option custom style is
    // evaluated here and emitted into the scoped rule by useStyles.
    const radioStyleJson = useActualContextExecution<CSSProperties>(model.radio?.style, undefined, {});
    const { styles } = useStyles({ ...model, radioStyleJson });

    const options = useRadioOptions({ ...model, dataSourceUrl: calculatedModel.dataSourceUrl });

    const componentApi = useComponentApi();
    const groupRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      componentApi?.updateApi<RadioApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'RadioApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'options', getter: () => options.map(({ label, value }) => ({ label, value: isDefined(value) ? `${value}` : undefined })) },
        ],
        api: {
          // Radio.Group renders a div, so focus the first enabled option inside it.
          focus: () => groupRef.current?.querySelector<HTMLInputElement>('input[type="radio"]:not(:disabled)')?.focus(),
        },
      });
    }, [componentApi, model.componentName, model.id, options]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    return (
      <ConfigurableFormItem<number | string> model={model} autoAlignLabel={false}>
        {(value, onChange, _, ctx) => {
          const selectedLabel = options.find((item) => `${item.value}` === `${value}`)?.label;

          return model.readOnly === true
            ? (
              <ReadOnlyDisplayFormItem
                value={selectedLabel}
                enableFullStyle={model.enableStyleOnReadonly}
                style={model.styleCss}
                styleValue={model}
              />
            )
            : (
              <RadioGroup
                ref={groupRef}
                className={styles.radioGroup}
                disabled={model.disabled === true}
                direction={model.direction}
                value={value ?? undefined}
                options={options}
                {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
                onChange={(event) => {
                  // antd stringifies the option value, so recover the original from the option
                  // list rather than re-parsing: that keeps a value's configured type intact,
                  // including numeric-looking strings such as "001" that parsing would corrupt.
                  const raw = event.target.value as string;
                  const selected = options.find((item) => `${item.value}` === raw)?.value;

                  // Use runtime guards to validate the selected value type
                  let newValue: number | string;
                  if (isDefined(selected) && (typeof selected === 'number' || typeof selected === 'string')) {
                    newValue = selected;
                  } else {
                    // Fallback to parsing or using raw value
                    newValue = getNumberOrUndefined(raw) ?? raw;
                  }

                  ctx?.handleEvent(event, { value: newValue }, model.onChangeCustom);
                  onChange(newValue);
                }}
                {...getComponentEvents<number | string>(model, ['onFocus', 'onBlur', 'onClick', 'onMouseEnter', 'onMouseLeave'], ctx, value, DataTypes.string)}
              />
            );
        }}
      </ConfigurableFormItem>
    );
  },

  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  validateModel: (model, addModelError) => {
    const dataSourceType = model.dataSourceType ?? 'values';
    if (dataSourceType === 'referenceList' && !isDefined(model.referenceListId))
      addModelError('referenceListId', 'Select `Reference List` on the settings panel');
    if (dataSourceType === 'values' && (model.items ?? []).length === 0)
      addModelError('items', 'Add `Items` on the settings panel, or select a different `Data Source Type`');
    if (dataSourceType === 'url' && isNullOrWhiteSpace(model.dataSourceUrl))
      addModelError('dataSourceUrl', 'Enter a `Data Source URL` on the settings panel');
  },
  getDefaultStyles: () => defaultStyles(),
  migrator: (m) =>
    m
      .add<IRadioComponentProps>(0, (prev, context) => {
        const configured = getStringEnumOrDefault<DataSourceType>(prev, "dataSourceType", DATA_SOURCE_TYPES);

        return {
          ...prev,
          dataSourceType: configured ?? (context.isNew === true ? undefined : 'values'),
          direction: getStringEnumOrDefault<DirectionType>(prev, "direction", DIRECTION_TYPE) ?? 'horizontal',
        };
      })
      .add<IRadioComponentProps>(1, (prev) => {
        return {
          ...prev,
          // eslint-disable-next-line @typescript-eslint/no-deprecated
          referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName) ?? undefined,
        };
      })
      .add<IRadioComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IRadioComponentProps>(3, (prev) => migrateVisibility(prev))
      .add<IRadioComponentProps>(4, (prev) => migrateReadOnly(prev))
      .add<IRadioComponentProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IRadioComponentProps>(6, (prev, context) => {
        if (context.isNew === true) return prev;

        const styles: IInputStyles = {
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<IRadioComponentProps>(7, (prev, context) => context.isNew === true
        ? prev
        : {
          ...prev,
          desktop: { ...migrateStyles(prev, {}, 'desktop'), enableStyleOnReadonly: (prev.desktop as IInputStyles | undefined)?.enableStyleOnReadonly ?? false },
        })
      .add<IRadioComponentProps>(8, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  linkToModelMetadata: (model, metadata): IRadioComponentProps => {
    const isRefList = metadata.dataType === DataTypes.referenceListItem;

    return {
      ...model,
      dataSourceType: isRefList ? 'referenceList' : 'values',
      referenceListId: isRefList && isNotNullOrWhiteSpace(metadata.referenceListName) && isNotNullOrWhiteSpace(metadata.referenceListModule)
        ? {
          module: metadata.referenceListModule,
          name: metadata.referenceListName,
        }
        : undefined,
    };
  },
  previewConfiguration: {
    type: 'radio',
    id: 'radio',
    propertyName: `radioAppearance`,
    label: `Radio Label`,
    version: 'latest',
    dataSourceType: 'values',
    direction: 'horizontal',
    items: [
      { id: 'radioPreviewOption1', label: 'Option 1', value: '1' },
      { id: 'radioPreviewOption2', label: 'Option 2', value: '2' },
      { id: 'radioPreviewOption3', label: 'Option 3', value: '3' },
    ],
  },
};

export default RadioComponent;
