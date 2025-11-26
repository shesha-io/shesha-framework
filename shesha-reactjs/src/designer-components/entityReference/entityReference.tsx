import { EntityReference, IEntityReferenceProps } from '@/components/entityReference';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { ShaIconTypes } from '@/components/iconPicker';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { LinkExternalOutlined } from '@/icons/linkExternalOutlined';
import { IToolboxComponent } from '@/interfaces';
import { isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import { IConfigurableFormComponent } from '@/providers/form/models';
import React from 'react';
import { migrateNavigateAction } from '../_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

export type IActionParameters = [{ key: string; value: string }];

export interface IEntityReferenceControlProps extends Omit<IEntityReferenceProps, 'style'>, IConfigurableFormComponent {
  /** @deprecated Use iconName instead */
  icon?: string;
}

// Helper function to normalize entity reference values to extract ID
const normalizeEntityReferenceValue = (value: any): any => {
  if (!value) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return value.id ?? value;
  }
  return value;
};

// Component wrapper that normalizes the value for display and form storage
const EntityReferenceWrapper: React.FC<{
  model: IEntityReferenceControlProps;
  value: unknown;
  onChange?: (value: unknown) => void;
  style?: React.CSSProperties;
}> = ({ model, value, onChange, style }) => {
  // Normalize value for display: if it's an object, extract the id
  const normalizedValue = React.useMemo(() => normalizeEntityReferenceValue(value), [value]);

  // Normalize the form value if it's an object (ensure form stores just the ID)
  // This effect runs when value changes from non-object to object, or when object structure changes
  const previousValueRef = React.useRef<any>(value);

  React.useEffect(() => {
    // Normalize the form value if it's an object: extract and store just the ID
    if (onChange && value && typeof value === 'object' && value !== null && 'id' in value) {
      const idValue = value.id;
      const previousValue = previousValueRef.current;

      // Only normalize if:
      // 1. The ID exists and is valid
      // 2. The current value is an object (not already normalized to a string/primitive)
      // 3. The value has changed from the previous one
      if (idValue !== undefined && idValue !== null) {
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

  return <EntityReference {...model} value={normalizedValue} style={style} />;
};

const EntityReferenceComponent: IToolboxComponent<IEntityReferenceControlProps> = {
  type: 'entityReference',
  name: 'Entity Reference',
  isInput: true,
  isOutput: true,
  icon: <LinkExternalOutlined />,
  Factory: ({ model: passedModel }) => {
    const { allStyles, hidden, readOnly, ...model } = passedModel;

    if (hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          return (
            <EntityReferenceWrapper
              model={model}
              value={value}
              onChange={onChange}
              style={{ ...allStyles.fullStyle }}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
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
        iconName: (prev?.iconName as ShaIconTypes) ?? (prev?.icon as ShaIconTypes),
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
      })),
  linkToModelMetadata: (model, propMetadata): IEntityReferenceControlProps => {
    return {
      ...model,
      entityType: isEntityReferencePropertyMetadata(propMetadata)
        ? { name: propMetadata.entityType, module: propMetadata.entityModule ?? null }
        : undefined,
    };
  },
};

export default EntityReferenceComponent;
