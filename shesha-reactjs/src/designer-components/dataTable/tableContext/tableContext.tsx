import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import DataTableProvider from '@/providers/dataTable';
import React, { FC, ReactElement, useMemo } from 'react';
import { ConfigurableFormItem } from '@/components';
import { evaluateString } from '@/providers/form/utils';
import { evaluateYesNo } from '@/utils/form';
import { useForm, useFormData, useNestedPropertyMetadatAccessor } from '@/providers';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { ITableContextComponentProps } from './models';
import { SheshaError } from '@/utils/errors';
import { useActualContextExecution } from '@/hooks';
import { DatabaseOutlined } from '@ant-design/icons';
import { useStyles } from './styles';
import { ShaForm } from '@/providers/form';
import { useParent } from '@/providers/parentProvider';

type ITableContextInnerProps = ITableContextComponentProps;

export const TableContextInner: FC<ITableContextInnerProps> = (props) => {
  const { sourceType, entityType, endpoint, customReorderEndpoint, id, propertyName, componentName, allowReordering, components } = props;
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

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(props.entityType);
  const permanentFilter = useFormEvaluatedFilter({ filter: props.permanentFilter, metadataAccessor: propertyMetadataAccessor });

  const getDataPath = evaluateString(endpoint, { data });

  if (!sourceType)
    throw SheshaError.throwPropertyError('sourceType');
  if (sourceType === 'Entity' && !entityType)
    throw SheshaError.throwPropertyError('entityType');
  if (sourceType === 'Url' && !endpoint)
    throw SheshaError.throwPropertyError('endpoint');
  if (sourceType === 'Form' && !propertyName)
    throw SheshaError.throwPropertyError('propertyName');

  const provider = (getFieldValue = undefined, onChange = undefined): ReactElement => {
    // Determine the appropriate style class based on designer mode and child components
    const getStyleClass = (): string => {
      if (!isDesignerMode && hasChildComponents) return styles.dataContextRuntime;
      if (!isDesignerMode && !hasChildComponents) return styles.dataContextRuntimeEmpty;
      return hasChildComponents ? styles.dataContextDesignerWithChildren : styles.dataContextDesignerEmpty;
    };

    return (
      <div className={cx(getStyleClass())}>
        {isDesignerMode && (
          <div className="data-context-label">
            <DatabaseOutlined />
            Data Context {hasChildComponents && `(${childComponentIds.length} child components)`}
          </div>
        )}
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
        >
          {!isDesignerMode && !hasChildComponents && (
            <div className="data-context-label">
              <DatabaseOutlined />
              Data Context (No child components found)
            </div>
          )}
          <ComponentsContainer
            containerId={id}
            className={isDesignerMode ? `${styles.dataContextComponentsContainer} ${!hasChildComponents ? styles.dataContextComponentsContainerEmpty : ''}` : undefined}
            itemsLimit={-1}
          />
        </DataTableProvider>
      </div>
    );
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
    return `${props.sourceType}_${props.propertyName}_${props.entityType ?? 'empty'}`; // is used just for re-rendering
  }, [props.sourceType, props.propertyName, props.entityType]);

  return <TableContextInner key={uniqueKey} {...props} />;
};
