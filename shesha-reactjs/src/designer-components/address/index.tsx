import { HomeOutlined } from '@ant-design/icons';
import { extractStyleValue } from '@/providers/form/models';

import { migratePropertyName, migrateCustomFunctions, migrateReadOnly, migrateHiddenToVisible, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { useEffect, useMemo, useRef } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import AutoCompletePlacesControl from './control';
import { AddressComponentDefinition, IAddressCompomentProps } from './models';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './formSettings';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { defaultStyles, getAddressValue } from './utils';
import { useStyles } from './styles';
import { isIAddressAndCoords } from '@/components/googlePlacesAutocomplete';
import { DataTypes } from '@/interfaces/dataTypes';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useComponentApi } from '@/providers/componentApi/provider';
import { AddressApi } from '@/componentsApi/componentApi';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';
import { isDefined } from '@/utils/nullables';
import { InputRef } from 'antd';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const AddressCompoment: AddressComponentDefinition = {
  allowInherit: true,
  type: 'address',
  name: 'Address',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <HomeOutlined />,
  preserveDimensionsInDesigner: true,
  Factory: ({ model }) => {
    const componentApi = useComponentApi();
    const inputRef = useRef<InputRef>(null);
    useEffect(() => {
      componentApi?.updateApi<AddressApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'AddressApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        api: { focus: () => inputRef.current?.focus() },
      });
      return () => componentApi?.removeApi(model.id);
    }, [componentApi, model.componentName, model.id]);

    const { styles } = useStyles(model);

    /* Only the Appearance properties, not the whole model: the suggestion list and the read-only
       renderer style themselves from these, and handing them the full model would widen their
       contract to every data-source and event setting on it. Memoised so the object identity is
       stable across renders. */
    const styleValue = useMemo(() => extractStyleValue(model), [model]);

    return (
      <ConfigurableFormItem<string> model={model}>
        {(value, onChange, _, ctx) => {
          return model.readOnly === true
            ? (
              <ReadOnlyDisplayFormItem
                value={getAddressValue(value)}
                enableFullStyle={model.enableStyleOnReadonly}
                styleValue={styleValue}
                // The Custom style, so read-only matches the editable control. It lands inline on
                // the same element as the class, where it beats the configured Font.
                {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
              />
            )
            : (
              <AutoCompletePlacesControl
                countryRestriction={model.countryRestriction}
                debounce={model.debounce}
                googleMapsApiKey={model.googleMapsApiKey}
                latPriority={model.latPriority}
                lngPriority={model.lngPriority}
                minCharactersSearch={model.minCharactersSearch}
                openCageApiKey={model.openCageApiKey}
                placeholder={model.placeholder}
                prefix={model.prefix}
                radiusPriority={model.radiusPriority}
                showPriorityBounds={model.showPriorityBounds}
                styleValue={styleValue}
                readOnly={model.readOnly}
                disabled={model.disabled}
                value={value ?? ""}
                inputRef={inputRef}
                className={styles.address}
                onChange={(newValue) => {
                  ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
                  onChange(newValue);
                }}
                onSelect={(event) => ctx?.handleEvent(undefined, { value: isIAddressAndCoords(event) ? event.address : undefined, event }, model.onSelectCustom)}
                // onFocus is part of the standard set below, so it is bound there rather than
                // passed explicitly — wiring both would fire the handler twice.
                inputProps={getComponentEvents<string>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.string)}
                {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
              />
            );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  getDefaultStyles: () => defaultStyles(),
  migrator: (m) => m
    .add<IAddressCompomentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAddressCompomentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAddressCompomentProps>(2, (prev) => migrateReadOnly(prev))
    .add<IAddressCompomentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IAddressCompomentProps>(4, (prev) => ({ ...prev, onSelectCustom: migrateFormApi.withoutFormData(prev.onSelectCustom) }))
    .add<IAddressCompomentProps>(5, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IAddressCompomentProps>(6, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  previewConfiguration: {
    type: 'address',
    id: 'address',
    propertyName: `addressAppearance`,
    label: `Address Label`,
    placeholder: 'Search places',
    version: 'latest',
  },
};

export default AddressCompoment;
