import { EntityReference, EntityReferenceValue } from '@/components/entityReference';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { ShaIconTypes } from '@/components/iconPicker';
import {
  migrateCustomFunctions,
  migrateHiddenToVisible,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { LinkExternalOutlined } from '@/icons/linkExternalOutlined';
import { DataTypes } from '@/interfaces/dataTypes';
import { isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { migrateNavigateAction } from '../_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migrateButtonGroupDynamicItems } from '../_common-migrations/migrateButtonGroupDynamicItems';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';
import { EntityReferenceComponentDefinition, IEntityReferenceControlProps } from './interfaces';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { defaultStyles } from './utils';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { EntityReferenceApi } from '@/componentsApi/componentApi';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getIdOrUndefined } from '@/utils/entity';

import apiCode from "../../componentsApi/componentApi.ts?raw";

export type { IActionParameters, IEntityReferenceControlProps } from './interfaces';

/** Reduce any of the accepted value shapes to the referenced entity's id. */
const normalizeEntityReferenceValue = (
  value: EntityReferenceValue | string | undefined,
): string | null => {
  if (!isDefined(value))
    return null;
  if (typeof value === 'string' || typeof value === 'number') return value;

  return getIdOrUndefined(value) ?? null;
};

// Component wrapper that normalizes the value for display and form storage
const EntityReferenceWrapper: React.FC<{
  model: IEntityReferenceControlProps;
  value: EntityReferenceValue | undefined;
  onChange?: ((value: EntityReferenceValue | null) => void) | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}> = ({ model, value, onChange, className, style }) => {
  // Normalize value for display: if it's an object, extract the id
  const normalizedValue = React.useMemo(() => normalizeEntityReferenceValue(value), [value]);

  // Normalize the form value if it's an object (ensure form stores just the ID)
  // This effect runs when value changes from non-object to object, or when object structure changes
  const previousValueRef = React.useRef<EntityReferenceValue>(value);

  React.useEffect(() => {
    // Normalize the form value if it's an object: extract and store just the ID
    if (onChange && isDefined(value) && typeof value === 'object' && 'id' in value) {
      const idValue = value.id;
      const previousValue = previousValueRef.current;

      // Only normalize if:
      // 1. The ID exists and is valid
      // 2. The current value is an object (not already normalized to a string/primitive)
      // 3. The value has changed from the previous one
      if (isDefined(idValue)) {
        const previousId = typeof previousValue === 'object' && previousValue !== null
          ? previousValue.id
          : previousValue;

        // Normalize if the ID is different from previous, or if previous wasn't an object
        if (idValue !== previousId) {
          onChange(idValue);
        }
      }
    }

    // Update the ref to track the current value
    previousValueRef.current = value;
  }, [value, onChange]);

  return (
    <EntityReference
      {...model}
      value={normalizedValue}
      readOnly={model.readOnly === true}
      disabled={model.disabled === true}
      className={className}
      style={style}
    />
  );
};

const EntityReferenceComponent: EntityReferenceComponentDefinition = {
  allowInherit: true,
  type: 'entityReference',
  name: 'Entity Reference',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <LinkExternalOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.entityReference,
  Factory: ({ model }) => {
    const componentApi = useComponentApi();
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      componentApi?.updateApi<EntityReferenceApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'EntityReferenceApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'entityReferenceType', getter: () => model.entityReferenceType },
        ],
        // `focus` needs a ref to the rendered node, so it is implemented here rather than inherited.
        api: { focus: () => containerRef.current?.querySelector<HTMLElement>('a, button')?.focus() },
      });
    }, [componentApi, model.componentName, model.id, model.entityReferenceType]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles(model);

    return (
      <ConfigurableFormItem<EntityReferenceValue> model={model}>
        {(value, onChange, _, ctx) => {
          return (
            <span
              ref={containerRef}
              {...getComponentEvents<EntityReferenceValue>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.entityReference)}
            >
              <EntityReferenceWrapper
                model={model}
                value={value}
                onChange={(newValue) => {
                  ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
                  onChange(newValue);
                }}
                className={styles.entityReference}
                {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
              />
            </span>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  getDefaultStyles: () => defaultStyles(),
  migrator: (m) =>
    m
      .add<IEntityReferenceControlProps>(0, (prev) => {
        return {
          ...prev,
          formSelectionMode: 'name',
          entityReferenceType: 'Quickview',
          quickviewWidth: 600,
          displayProperty: '',
          handleFail: false,
          handleSuccess: false,
          style: prev.style,
          stylingBox: prev.stylingBox,
        };
      })
      .add<IEntityReferenceControlProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IEntityReferenceControlProps>(2, (prev) => migrateVisibility(prev))
      .add<IEntityReferenceControlProps>(3, (prev) => ({
        ...prev,
        onSuccess: migrateNavigateAction(prev.onSuccess),
        onFail: migrateNavigateAction(prev.onFail),
      }))
      .add<IEntityReferenceControlProps>(4, (prev) => migrateReadOnly(prev, 'editable'))
      .add<IEntityReferenceControlProps>(5, (prev, context) => ({
        ...prev,
        footerButtons: context.isNew ? 'default' : (prev.footerButtons ?? prev.showModalFooter) ? 'default' : 'none',
      }))
      .add<IEntityReferenceControlProps>(6, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IEntityReferenceControlProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
      .add<IEntityReferenceControlProps>(8, (prev) => ({
        ...prev,
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        iconName: (prev.iconName ?? prev.icon) as ShaIconTypes | undefined,
      }))
      .add<IEntityReferenceControlProps>(9, (prev) => ({
        ...prev,
        style: prev.style,
        mobile: {
          ...prev.mobile,
          style: prev.style,
        },
        tablet: {
          ...prev.tablet,
          style: prev.style,
        },
        desktop: {
          ...prev.desktop,
          style: prev.style,
        },
      }))
      .add<IEntityReferenceControlProps>(10, (prev) => ({
        ...prev,
        modalWidth: (prev.modalWidth as string) === 'custom' ? '80%' : prev.modalWidth,
        quickviewWidth: (() => {
          if (prev.quickviewWidth == null || prev.quickviewWidth === '') return undefined;
          if (typeof prev.quickviewWidth === 'number') return `${prev.quickviewWidth}px`;
          if (/^\d+$/.test(prev.quickviewWidth)) return `${prev.quickviewWidth}px`; // digit-only string
          if (/^\d+(px|%)$/.test(prev.quickviewWidth)) return prev.quickviewWidth; // already valid
          return prev.quickviewWidth; // keep keywords like 'auto', 'fit-content', etc.
        })(),
      }))
      .add<IEntityReferenceControlProps>(11, (prev) => ({ ...prev, buttons: migrateButtonGroupDynamicItems(prev.buttons) }))
      /* Freeze the appearance of components saved before the refactor: bake this component's real
         defaults into all three device models, so an old form keeps the look it had rather than
         following whatever the code-level defaults become later. New drops skip it and inherit. */
      .add<IEntityReferenceControlProps>(12, (prev, context) => context.isNew === true
        ? prev
        : { ...migratePrevStyles(prev, defaultStyles()) })
      /* Rename-only step, last and unguarded: Hidden -> Visible and permissions -> visiblePermissions,
         which now hang off the Visible and Interaction Mode settings. */
      .add<IEntityReferenceControlProps>(13, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev))),
  linkToModelMetadata: (model, propMetadata): IEntityReferenceControlProps => {
    return {
      ...model,
      /* Inheritance path, not a defaults seeder: only fill the entity type when the user has not
         configured one. */
      entityType: isDefined(model.entityType)
        ? model.entityType
        : isEntityReferencePropertyMetadata(propMetadata) && !isNullOrWhiteSpace(propMetadata.entityType)
          ? { name: propMetadata.entityType, module: propMetadata.entityModule ?? null }
          : undefined,
    };
  },
  previewConfiguration: {
    type: 'entityReference',
    id: 'entityReference',
    propertyName: `entityReferenceAppearance`,
    label: `Entity Reference Label`,
    version: 'latest',
    entityReferenceType: 'Quickview',
    formSelectionMode: 'name',
    displayProperty: '',
    displayType: 'textTitle',
    textTitle: 'Entity Reference',
    handleSuccess: false,
    handleFail: false,
  },
};

export default EntityReferenceComponent;
