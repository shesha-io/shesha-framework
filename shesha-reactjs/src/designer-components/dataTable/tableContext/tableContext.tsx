import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import DataTableProvider from '@/providers/dataTable';
import React, { FC, ReactElement, useMemo } from 'react';
import { ConfigurableFormItem, ErrorIconPopover } from '@/components';
import { evaluateString } from '@/providers/form/utils';
import { evaluateYesNo } from '@/utils/form';
import { useForm, useFormData, useNestedPropertyMetadatAccessor } from '@/providers';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { ITableContextComponentProps } from './models';
import { IModelValidation } from '@/utils/errors';
import { useActualContextExecution } from '@/hooks';
import { useStyles } from './styles';
import { ShaForm } from '@/providers/form';
import { useParent } from '@/providers/parentProvider';
import TableContextEmptyState from './tableContextEmptyState';
import { getEntityTypeName, isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';

type ITableContextInnerProps = ITableContextComponentProps;

/**
 * Helper to check if component has configuration errors (for internal DataTableProvider logic)
 * This does NOT display errors - that's handled by FormComponent wrapper via validateModel
 */
const getInternalValidationStatus = (
  sourceType: ITableContextComponentProps['sourceType'],
  entityType: ITableContextComponentProps['entityType'],
  endpoint: ITableContextComponentProps['endpoint'],
  propertyName: ITableContextComponentProps['propertyName'],
): IModelValidation | undefined => {
  const hasConfigError = !sourceType ||
    (sourceType === 'Entity' && isEntityTypeIdEmpty(entityType)) ||
    (sourceType === 'Url' && !endpoint) ||
    (sourceType === 'Form' && !propertyName);

  if (hasConfigError) {
    return {
      hasErrors: true,
      componentType: 'dataContext',
      errors: [],
      validationType: 'warning',
    };
  }

  return undefined;
};

export const TableContextInner: FC<ITableContextInnerProps> = (props) => {
  const { sourceType, entityType, endpoint, customReorderEndpoint, id, propertyName, componentName, allowReordering, components, onBeforeRowReorder, onAfterRowReorder } = props;
  const { formMode } = useForm();
  const { data } = useFormData();
  const { styles } = useStyles();
  const parent = useParent();

  const isDesignerMode = formMode === 'designer';

  // Use real-time child component tracking in designer mode, fallback to static components prop in runtime
  const childComponentIds = ShaForm.useChildComponentIds(id.replace(`${parent?.subFormIdPrefix}.`, ''));

  const hasChildComponents = isDesignerMode
    ? childComponentIds.length > 0
    : (components && components.length > 0) || childComponentIds.length > 0;
  const disableRefresh: boolean = useActualContextExecution(props.disableRefresh, null, false);

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const permanentFilter = useFormEvaluatedFilter({ filter: props.permanentFilter, metadataAccessor: propertyMetadataAccessor });

  const getDataPath = evaluateString(endpoint, { data });

  // Get internal validation status for DataTableProvider (used for internal logic only)
  // Error display is handled by FormComponent wrapper via validateModel
  const internalValidation = getInternalValidationStatus(sourceType, entityType, endpoint, propertyName);

  const provider = (getFieldValue = undefined, onChange = undefined): ReactElement => {
    // Determine the appropriate style class based on designer mode and child components
    const styleClass = isDesignerMode
      ? (hasChildComponents ? styles.dataContextDesignerWithChildren : styles.dataContextDesignerEmpty)
      : (hasChildComponents ? styles.dataContextRuntime : styles.dataContextRuntimeEmpty);

    // If there are validation errors, don't render children - just show the empty state or wrapper
    const hasValidationErrors = internalValidation?.hasErrors;

    // Render wrapper div with computed styleClass; inner children differ based on empty state
    return (
      <div className={styleClass}>
        {hasValidationErrors || (isDesignerMode && !hasChildComponents) ? (
          <TableContextEmptyState
            containerId={id}
            componentId={id}
            readOnly={hasValidationErrors}
          />
        ) : (
          <DataTableProvider
            userConfigId={props.id}
            entityType={entityType}
            getDataPath={getDataPath}
            propertyName={propertyName}
            actionOwnerId={id}
            actionOwnerName={componentName}
            sourceType={props.sourceType}
            initialPageSize={props.defaultPageSize ?? 10}
            dataFetchingMode={props.dataFetchingMode ?? 'paging'}
            getFieldValue={getFieldValue}
            onChange={onChange}
            grouping={props.grouping}
            sortMode={props.sortMode}
            strictSortBy={props.strictSortBy}
            strictSortOrder={props.strictSortOrder}
            standardSorting={props.standardSorting}
            allowReordering={evaluateYesNo(allowReordering, formMode)}
            permanentFilter={permanentFilter}
            disableRefresh={disableRefresh}
            customReorderEndpoint={customReorderEndpoint}
            onBeforeRowReorder={onBeforeRowReorder}
            onAfterRowReorder={onAfterRowReorder}
            contextValidation={internalValidation}
          >
            <ComponentsContainer
              containerId={id}
              className={isDesignerMode ? [styles.dataContextComponentsContainer, !hasChildComponents && styles.dataContextComponentsContainerEmpty].filter(Boolean).join(' ') : undefined}
              itemsLimit={-1}
              emptyInsertThreshold={20}
              showHintWhenEmpty={false}
            />
          </DataTableProvider>
        )}
      </div>
    );
  };

  if (props.hidden) {
    return null;
  }

  const componentContent = sourceType === 'Form'
    ? (
      <ConfigurableFormItem model={{ ...props, hideLabel: true }} wrapperCol={{ md: 24 }}>
        {(value, onChange) => provider(() => value, onChange)}
      </ConfigurableFormItem>
    )
    : provider();

  return componentContent;
};

export const TableContext: FC<ITableContextComponentProps> = (props) => {
  const uniqueKey = useMemo(() => {
    return `${props.sourceType}_${props.propertyName}_${getEntityTypeName(props.entityType) ?? 'empty'}`; // is used just for re-rendering
  }, [props.sourceType, props.propertyName, props.entityType]);

  return <TableContextInner key={uniqueKey} {...props} />;
};
