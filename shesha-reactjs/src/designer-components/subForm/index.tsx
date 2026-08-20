import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { FormOutlined } from '@ant-design/icons';
import { isFormFullName, isFormRawId } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ISubFormProviderProps, SubFormApiMode } from '@/providers/subForm/interfaces';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { useFormItem, UnwrapCodeEvaluators, SubFormProvider } from '@/providers';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { getStringPropertyOrUndefined } from '@/utils/object';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import SubForm from './subForm';
import { useMemo } from 'react';
import { useStyles } from './styles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';

export interface ISubFormComponentProps extends Omit<ISubFormProviderProps, 'labelCol' | 'wrapperCol'>, IConfigurableFormComponent {
  labelCol?: number;
  wrapperCol?: number;
  queryParams?: ISubFormProviderProps['queryParams'];
}

export const isSubFormComponent = (component: IConfigurableFormComponent | UnwrapCodeEvaluators<IConfigurableFormComponent>): component is ISubFormComponentProps => component.type === SubFormComponent.type;

const getSubFormOwnFields = (propertyName: string): string[] => [
  `${propertyName}.id`,
  `${propertyName}._displayName`,
  `${propertyName}._className`,
];

const SubFormComponent: IToolboxComponent<ISubFormComponentProps> = {
  allowInherit: true,
  type: 'subForm',
  name: 'Sub Form',
  icon: <FormOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const { namePrefix } = useFormItem();
    const { styles } = useStyles();

    const labelCol = useMemo(() => ({ span: model.hideLabel === true ? 0 : model.labelCol ?? 0 }), [model.hideLabel, model.labelCol]);
    const wrapperCol = useMemo(() => ({ span: model.hideLabel === true ? 24 : model.wrapperCol ?? 0 }), [model.hideLabel, model.wrapperCol]);

    if (model.hidden === true) return null;

    const propertyName = !isNullOrWhiteSpace(namePrefix) ? [namePrefix, model.propertyName].join('.') : model.propertyName;

    return (
      <ConfigurableFormItem<object> model={model} labelCol={labelCol} wrapperCol={wrapperCol} className={styles.shaSubFormContainer}>
        {(value, onChange) => {
          return (
            <SubFormProvider {...model} key={`subform-${model.id}`} value={value ?? undefined} propertyName={propertyName} onChange={onChange}>
              <SubForm style={model.styleCss} readOnly={model.readOnly} />
            </SubFormProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  // settingsFormMarkup: alertSettingsForm,
  migrator: (m) => m
    .add<ISubFormComponentProps>(0, (prev) => ({ ...prev, apiMode: getStringPropertyOrUndefined(prev, 'apiMode') as SubFormApiMode | undefined ?? 'entityName' }))
    .add<ISubFormComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ISubFormComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ISubFormComponentProps>(3, (prev) => ({
      ...migrateFormApi.properties(prev),
      onCreated: migrateFormApi.withoutFormData(prev.onCreated),
      onUpdated: migrateFormApi.withoutFormData(prev.onUpdated),
    }))
    .add<ISubFormComponentProps>(4, (prev) => ({ ...prev, hideLabel: true }))
    .add<ISubFormComponentProps>(5, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  settingsFormMarkup: getSettings,
  initModel: (model) => {
    const customProps: ISubFormComponentProps = {
      ...model,
      dataSource: 'form',
      apiMode: 'entityName',
      labelCol: 8,
      wrapperCol: 16,
    };
    return customProps;
  },
  linkToModelMetadata: (model, propMetadata): ISubFormComponentProps => {
    // the `dynamic` selection mode resolves the form from the entity type, and the `Entity Type` setting is not
    // shown while `dataSource` = `form`. Take it from the bound property so the mode has something to resolve from
    return {
      ...model,
      entityType: isEntityReferencePropertyMetadata(propMetadata) && !isNullOrWhiteSpace(propMetadata.entityType)
        ? { name: propMetadata.entityType, module: propMetadata.entityModule ?? null }
        : undefined,
    };
  },
  getFieldsToFetch: (propertyName) => {
    return getSubFormOwnFields(propertyName);
  },
  getFieldsToFetchAsync: async (propertyName, rawModel, _metadata, context) => {
    const ownFields = getSubFormOwnFields(propertyName);

    // the sub-form fetches its own data in the `api` mode, in the `dynamic` mode the form to render
    // is known only at runtime. In both cases the parent form fetches the entity reference only
    if (rawModel.dataSource !== 'form' || rawModel.formSelectionMode === 'dynamic')
      return ownFields;

    // `formId` may be a code evaluator when it's configured as a JS setting, such forms can't be resolved here
    const formId = rawModel.formId;
    if (!isDefined(formId) || (!isFormRawId(formId) && !isFormFullName(formId)))
      return ownFields;

    try {
      const nestedFields = await context.getFormFieldsAsync(formId);
      return [...ownFields, ...nestedFields.map((field) => `${propertyName}.${field}`)];
    } catch (error) {
      // the entity reference itself is still required even if the nested form can't be loaded
      console.error(`Failed to get fields of the form rendered by the sub-form '${propertyName}'`, error);
      return ownFields;
    }
  },
};

export default SubFormComponent;
