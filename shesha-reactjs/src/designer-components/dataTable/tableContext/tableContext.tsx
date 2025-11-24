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
 * Validates the table context configuration and returns validation result
 */
const validateTableContext = (
  sourceType: string,
  entityType: ITableContextComponentProps['entityType'],
  endpoint: string,
  propertyName: string,
  hasChildComponents: boolean,
  componentId: string,
  componentName: string,
): IModelValidation | undefined => {
  // Check for missing required properties
  const missingProperty = !sourceType
    ? 'sourceType'
    : sourceType === 'Entity' && isEntityTypeIdEmpty(entityType)
      ? 'entityType'
      : sourceType === 'Url' && !endpoint
        ? 'endpoint'
        : sourceType === 'Form' && !propertyName
          ? 'propertyName'
          : null;

  if (missingProperty) {
    const getErrorMessage = (prop: string): string => {
      switch (prop) {
        case 'entityType':
          return 'Please configure a valid Entity Type in the component settings.';
        case 'endpoint':
          return 'Please configure a valid Endpoint in the component settings.';
        case 'propertyName':
          return 'Please configure a valid Property Name in the component settings.';
        case 'sourceType':
          return 'Please configure a Source Type in the component settings.';
        default:
          return 'Please configure the required properties in the component settings.';
      }
    };

    return {
      hasErrors: true,
      componentId,
      componentName,
      componentType: 'dataContext',
      errors: [{ propertyName: missingProperty, error: getErrorMessage(missingProperty) }],
      validationType: 'warning',
    };
  }

  if (!hasChildComponents) {
    // Show info icon when configured correctly but has no children
    return {
      hasErrors: true,
      componentId,
      componentName,
      componentType: 'dataContext',
      errors: [{ error: 'Drag and drop child components inside this Data Context to display data.' }],
      validationType: 'info',
    };
  }

  return undefined;
};

export const TableContextInner: FC<ITableContextInnerProps> = (props) => {
  const { sourceType, entityType, endpoint, customReorderEndpoint, id, propertyName, componentName, allowReordering, components, onBeforeRowReorder, onAfterRowReorder } = props;
  const { formMode } = useForm();
  const { data } = useFormData();
  const { styles, cx } = useStyles();
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

  // Validate component configuration
  const validationResult = validateTableContext(
    sourceType,
    entityType,
    endpoint,
    propertyName,
    hasChildComponents,
    id,
    componentName,
  );

  const provider = (getFieldValue = undefined, onChange = undefined): ReactElement => {
    // Determine the appropriate style class based on designer mode and child components
    const getStyleClass = (): string => {
      if (isDesignerMode)
        return hasChildComponents ? styles.dataContextDesignerWithChildren : styles.dataContextDesignerEmpty;
      else {
        if (hasChildComponents)
          return styles.dataContextRuntime;
        else
          return styles.dataContextRuntimeEmpty;
      }
    };

    // Show only the empty state box when empty and in designer mode
    let content: ReactElement;
    if (isDesignerMode && !hasChildComponents) {
      content = (
        <div className={cx(styles.dataContextDesignerEmpty)}>
          <TableContextEmptyState containerId={id} componentId={id} />
        </div>
      );
    } else {
      content = (
        <div className={getStyleClass()}>
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
          >
            <ComponentsContainer
              containerId={id}
              className={isDesignerMode ? `${styles.dataContextComponentsContainer} ${!hasChildComponents ? styles.dataContextComponentsContainerEmpty : ''}` : undefined}
              itemsLimit={-1}
              emptyInsertThreshold={20}
              showHintWhenEmpty={false}
            />
          </DataTableProvider>
        </div>
      );
    }

    // Wrap with error icon if there are validation errors
    if (validationResult?.hasErrors) {
      return (
        <ErrorIconPopover validationResult={validationResult}>
          {content}
        </ErrorIconPopover>
      );
    }

    return content;
  };

  if (props?.hidden) {
    return null;
  }
  return sourceType === 'Form'
    ? (
      <ConfigurableFormItem model={{ ...props, hideLabel: true }} wrapperCol={{ md: 24 }}>
        {(value, onChange) => provider(() => value, onChange)}
      </ConfigurableFormItem>
    )
    : provider();
};

export const TableContext: FC<ITableContextComponentProps> = (props) => {
  const uniqueKey = useMemo(() => {
    return `${props.sourceType}_${props.propertyName}_${getEntityTypeName(props.entityType) ?? 'empty'}`; // is used just for re-rendering
  }, [props.sourceType, props.propertyName, props.entityType]);

  return <TableContextInner key={uniqueKey} {...props} />;
};
