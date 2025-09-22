import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'antd';
import { DataList } from '@/components/dataList';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import classNames from 'classnames';
import moment from 'moment';
import { IDataListWithDataSourceProps } from './model';
import { useConfigurableAction, useConfigurableActionDispatcher, useHttpClient } from '@/providers';
import { BackendRepositoryType, ICreateOptions, IDeleteOptions, IUpdateOptions } from '@/providers/dataTable/repository/backendRepository';
import { useStyles } from '@/components/dataList/styles/styles';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { useDeepCompareMemo } from '@/hooks';
import { YesNoInherit } from '@/interfaces';
import { EmptyState } from '@/components';
import { IFormApi } from '@/providers/form/formApi';
import defaultPersonFormTemplate from './defaultPersonFormTemplate.json';
import { useMetadataDispatcher, useAppConfigurator } from '@/providers';
import { DataTypes } from '@/interfaces';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { extractFieldsFromFormConfig } from './fieldExtractor';

export const NotConfiguredWarning: FC = () => {
  return <Alert className="sha-designer-warning" message="Data list is not configured properly" type="warning" />;
};

export type OnSaveHandler = (data: object, formData: object, contexts: object, globalState: object) => Promise<object>;
export type OnSaveSuccessHandler = (
  data: object,
  form: IFormApi,
  contexts: object,
  globalState: object,
  setGlobalState: Function
) => void;

const DataListControl: FC<IDataListWithDataSourceProps> = (props) => {
  // Early return if dataSource is not provided to prevent crashes
  if (!props.dataSourceInstance) {
    console.error('DataListControl: dataSourceInstance is required but not provided');
    return <Alert message="DataList configuration error" description="Data source is not configured" type="error" />;
  }

  const {
    dataSourceInstance: dataSource,
    onListItemSave,
    onListItemSaveSuccessAction,
    customUpdateUrl,
    customCreateUrl,
    customDeleteUrl,
    canAddInline,
    canEditInline,
    canDeleteInline,
    readOnly,
    noDataText = "No Data",
    noDataSecondaryText = "No data is available for this list",
    noDataIcon,
    allStyles,
    onRowDeleteSuccessAction,
    orientation = 'vertical',
  } = props;
  const {
    tableData,
    isFetchingTableData,
    selectedIds,
    changeSelectedIds,
    getRepository,
    modelType,
    grouping,
    groupingColumns,
    setRowData
  } = dataSource || {};
  const { styles } = useStyles();
  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = dataSource || {};
  const httpClient = useHttpClient();
  const allData = useAvailableConstantsData();
  const isDesignMode = allData.form?.formMode === 'designer';
  const { executeAction } = useConfigurableActionDispatcher();
  const metadataDispatcher = useMetadataDispatcher();
  const { configurationItemMode } = useAppConfigurator();
  const { getEntityFormId, getForm } = useConfigurationItemsLoader();
  // TODO: Need to implement proper form fetching

  const repository = getRepository?.();

  // Register configurable columns for field fetching
  const registerConfigurableColumns = dataSource?.registerConfigurableColumns;
  const requireColumns = dataSource?.requireColumns;

  // Call requireColumns to indicate that this DataList needs columns functionality
  React.useEffect(() => {
    if (requireColumns) {
      requireColumns();
    }
  }, [requireColumns]);

  const onSelectRow = useCallback((index: number, row: any) => {
    if (row && setSelectedRow) {
      setSelectedRow(index, row);
    }
  }, [setSelectedRow]);

  const dataListRef = useRef<any>({});

  useConfigurableAction(
    {
      name: 'Add new item (if allowed)',
      owner: props.componentName,
      ownerUid: props.id,
      hasArguments: false,
      executer: () => {
        if (dataListRef.current?.addNewItem)
          dataListRef.current.addNewItem();
        return Promise.resolve();
      },
    },
    []
  );

  const data = useDeepCompareMemo(() => {
    // In designer mode, if we have no data, provide some sample data for preview
    if (isDesignMode && (!tableData || tableData.length === 0)) {
      return [
        {
          id: "sample-1",
          displayName: "Sample Item 1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          _className: modelType || "Entity"
        },
        {
          id: "sample-2",
          displayName: "Sample Item 2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          _className: modelType || "Entity"
        }
      ];
    }

    // Use real data from the data context
    return tableData;
  }, [tableData, isDesignMode, modelType]);

  // http, moment, setFormData
     const performOnRowDeleteSuccessAction = useMemo<OnSaveSuccessHandler>(() => {
        if (!onRowDeleteSuccessAction)
          return () => {
            /*nop*/
          };
        return (data, formApi, globalState, setGlobalState) => {
          const evaluationContext = {
            data,
            formApi,
            globalState,
            setGlobalState,
            http: httpClient,
            moment,
          };
          try {
            executeAction({
              actionConfiguration: onRowDeleteSuccessAction,
              argumentsEvaluationContext: evaluationContext,
            });
          } catch (error) {
            console.error('Error executing row delete success action:', error);
          }
        };
      }, [onRowDeleteSuccessAction, httpClient]);


  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onListItemSave) return (data) => Promise.resolve(data);

    const executer = new Function('data, form, contexts, globalState, http, moment', onListItemSave);
    return (data, form, contexts, globalState) => {
      const preparedData = executer(data, form, contexts, globalState, allData.http, allData.moment);
      return Promise.resolve(preparedData);
    };
  }, [onListItemSave]);

  const performOnRowSaveSuccess = useMemo<OnSaveSuccessHandler>(() => {
    if (!onListItemSaveSuccessAction)
      return () => {
        //nop
      };

    return (data, form, contexts, globalState, setGlobalState) => {
      const evaluationContext = {
        data,
        form,
        contexts,
        globalState,
        setGlobalState,
        http: allData.http,
        moment,
      };
      // execute the action
      executeAction({
        actionConfiguration: onListItemSaveSuccessAction,
        argumentsEvaluationContext: evaluationContext,
      });
    };
  }, [onListItemSaveSuccessAction]);

  const updater = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = getRepository?.();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, allData.form, allData.contexts ?? {}, allData.globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customUpdateUrl } as IUpdateOptions)
          : undefined;

      return repository.performUpdate(rowIndex, preparedData, options).then((response) => {
        setRowData?.(rowIndex, preparedData/*, response*/);
        performOnRowSaveSuccess(preparedData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
        return response;
      });
    });
  };

  const creater = (rowData: any): Promise<any> => {
    const repository = getRepository?.();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, allData.data ?? {}, allData.contexts ?? {}, allData.globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customCreateUrl } as ICreateOptions)
          : undefined;

      return repository.performCreate(0, preparedData, options).then(() => {
        dataSource.refreshTable?.();
        performOnRowSaveSuccess(preparedData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
      });
    });
  };

  const deleter = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = getRepository?.();
    if (!repository) return Promise.reject('Repository is not specified');

    const options =
      repository.repositoryType === BackendRepositoryType
        ? ({ customUrl: customDeleteUrl } as IDeleteOptions)
        : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      if (props.onRowDeleteSuccessAction) {
        performOnRowDeleteSuccessAction(rowData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
      }
      dataSource.refreshTable?.();
    });
  };

  const canAction = (val: YesNoInherit) => {
    switch (val) {
      case 'yes':
        return true;
      case 'no':
        return false;
      case 'inherit':
        return !readOnly;
    }
    return false;
  };

  const isFormMissing = isDesignMode && (
    !repository
    || !props.formId && props.formSelectionMode === "name"
    || !props.formType && props.formSelectionMode === "view"
    || !props.formIdExpression && props.formSelectionMode === "expression"
  );

  const width = props.modalWidth === 'custom' && props.customWidth ? `${props.customWidth}${props.widthUnits}` : props.modalWidth;

  // State to track extracted fields from form template
  const [extractedFields, setExtractedFields] = useState<string[]>([]);
  const [hasRegisteredFields, setHasRegisteredFields] = useState(false);

  // Fallback to register common properties if field extraction fails
  const registerFallbackProperties = useCallback(async () => {
    if (!registerConfigurableColumns || !modelType || hasRegisteredFields) {
      return;
    }

    try {
      if (isDesignMode) {
        console.warn(`DataList (${props.id}): Using fallback properties for entity:`, modelType);
      }

      const fallbackProperties = ['id', 'firstName', 'lastName', 'jobTitle', 'name', 'displayName', 'email', 'phoneNumber'];
      const virtualColumns = fallbackProperties.map((propertyName, index) => ({
        id: `datalist_fallback_${propertyName}`,
        propertyName: propertyName,
        caption: propertyName,
        itemType: 'item' as const,
        sortOrder: index,
        isVisible: false,
        columnType: 'data' as const,
        propertiesToFetch: propertyName,
      }));

      registerConfigurableColumns(`datalist_fallback_${props.id}`, virtualColumns);
      setHasRegisteredFields(true);

      if (isDesignMode) {
        console.warn(`DataList (${modelType}): Using fallback properties:`, fallbackProperties.join(', '));
      }
    } catch (error) {
      console.error(`DataList: Failed to register fallback properties for ${modelType}:`, error);
    }
  }, [registerConfigurableColumns, isDesignMode, props.id, modelType, hasRegisteredFields]);

  // Register specific properties based on form template field extraction with validation
  const registerExtractedFields = useCallback(async (fields: string[]) => {
    if (!registerConfigurableColumns || !modelType || fields.length === 0) {
      return;
    }

    try {
      if (isDesignMode) {
        console.warn(`DataList (${props.id}): Validating and registering extracted fields for entity ${modelType}:`, fields);
      }

      // Always include 'id' field as it's essential for DataList functionality
      let fieldsWithId = ['id', ...fields.filter(f => f !== 'id')];

      // Validate fields against entity metadata if available
      try {
        const metadata = await metadataDispatcher.getMetadata({
          dataType: DataTypes.entityReference,
          modelType: modelType
        });

        if (metadata?.properties) {
          const availableProperties = Object.keys(metadata.properties);
          const validFields: string[] = [];
          const invalidFields: string[] = [];

          fieldsWithId.forEach(field => {
            // For nested properties like 'person.firstName', check if 'person' exists
            const topLevelProperty = field.split('.')[0];

            if (availableProperties.includes(topLevelProperty)) {
              validFields.push(field);
            } else {
              invalidFields.push(field);
            }
          });

          if (invalidFields.length > 0 && isDesignMode) {
            console.warn(`DataList (${modelType}): Found ${invalidFields.length} invalid field references in form template:`, invalidFields);
          }

          if (validFields.length > 0) {
            fieldsWithId = validFields;
            if (isDesignMode) {
              console.warn(`DataList (${modelType}): Using ${validFields.length} validated fields:`, validFields);
            }
          } else {
            // If no valid fields found, fall back to common properties
            if (isDesignMode) {
              console.warn(`DataList (${modelType}): No valid fields found, falling back to common properties`);
            }
            await registerFallbackProperties();
            return;
          }
        } else {
          if (isDesignMode) {
            console.warn(`DataList (${modelType}): Entity metadata not available, using extracted fields without validation`);
          }
        }
      } catch (metadataError) {
        if (isDesignMode) {
          console.warn(`DataList (${modelType}): Failed to get entity metadata, using extracted fields without validation:`, metadataError);
        }
      }

      // Create virtual columns for validated/extracted fields
      const virtualColumns = fieldsWithId.map((propertyName, index) => ({
        id: `datalist_extracted_${propertyName}`,
        propertyName: propertyName,
        caption: propertyName,
        itemType: 'item' as const,
        sortOrder: index,
        isVisible: false, // Hidden columns, only for field fetching
        columnType: 'data' as const,
        propertiesToFetch: propertyName,
      }));

      // Register extracted fields as virtual columns
      registerConfigurableColumns(`datalist_extracted_${props.id}`, virtualColumns);
      setHasRegisteredFields(true);

      if (isDesignMode) {
        console.warn(`DataList (${modelType}): Successfully registered ${fieldsWithId.length} validated fields for optimized fetching:`, fieldsWithId.join(', '));
      }
    } catch (error) {
      console.error(`DataList: Failed to register extracted fields for ${modelType}:`, error);
      // Fallback to registering common properties on error
      await registerFallbackProperties();
    }
  }, [registerConfigurableColumns, isDesignMode, props.id, modelType, metadataDispatcher, registerFallbackProperties]);

  // Auto-detect smart display properties when no form is configured
  const registerSmartDisplayProperties = useCallback(async () => {
    if (!modelType || hasRegisteredFields) return;

    try {
      if (isDesignMode) {
        console.warn(`DataList (${props.id}): No form configured, using smart display mode for entity:`, modelType);
      }

      // Get entity metadata to determine good display properties
      const metadata = await metadataDispatcher.getMetadata({
        dataType: DataTypes.entityReference,
        modelType: modelType
      });

      if (metadata?.properties) {
        const availableProperties = Object.keys(metadata.properties);

        // Smart property selection for display (prioritize useful display fields)
        const smartProperties = [
          'id', // Always include ID
          ...availableProperties.filter(prop => {
            const lowerProp = prop.toLowerCase();
            // High priority display fields
            return lowerProp.includes('name') ||
                   lowerProp.includes('title') ||
                   lowerProp.includes('display') ||
                   lowerProp.includes('description') ||
                   lowerProp.includes('email') ||
                   lowerProp.includes('code') ||
                   lowerProp.includes('reference') ||
                   lowerProp.includes('status');
          }),
          // Add some common text fields if we don't have many display fields yet
          ...availableProperties.filter(prop => {
            const lowerProp = prop.toLowerCase();
            return lowerProp.includes('department') ||
                   lowerProp.includes('position') ||
                   lowerProp.includes('phone') ||
                   lowerProp.includes('mobile') ||
                   lowerProp.includes('category') ||
                   lowerProp.includes('type');
          })
        ].slice(0, 12); // Limit to reasonable number

        const virtualColumns = smartProperties.map((propertyName, index) => ({
          id: `datalist_smart_${propertyName}`,
          propertyName: propertyName,
          caption: propertyName,
          itemType: 'item' as const,
          sortOrder: index,
          isVisible: false, // Hidden columns, only for field fetching
          columnType: 'data' as const,
          propertiesToFetch: propertyName,
        }));

        // Register smart display properties
        registerConfigurableColumns(`datalist_smart_${props.id}`, virtualColumns);
        setHasRegisteredFields(true);

        if (isDesignMode) {
          console.warn(`DataList (${modelType}): Registered ${smartProperties.length} smart display properties:`, smartProperties.join(', '));
        }
        return;
      } else {
        // Fallback to common properties if metadata not available
        await registerFallbackProperties();
      }
    } catch (error) {
      console.error(`DataList: Error in smart display property detection:`, error);
      await registerFallbackProperties();
    }
  }, [modelType, hasRegisteredFields, registerConfigurableColumns, props.id, metadataDispatcher, isDesignMode, registerFallbackProperties]);

  // Preload form template to extract fields early (before data fetching)
  const preloadFormTemplate = useCallback(async () => {
    if (!modelType || hasRegisteredFields) return;

    // Check if we have a form configured
    const hasFormConfigured =
      (props.formSelectionMode === 'name' && props.formId) ||
      (props.formSelectionMode === 'view' && props.formType) ||
      props.formSelectionMode === 'expression';

    if (!hasFormConfigured) {
      // No form configured - use smart display mode
      await registerSmartDisplayProperties();
      return;
    }

    try {
      let formToLoad = null;
      let formTypeToLoad = null;

      // Determine which form to preload based on selection mode
      switch (props.formSelectionMode) {
        case 'name':
          formToLoad = props.formId;
          break;
        case 'view':
          formTypeToLoad = props.formType;
          break;
        case 'expression':
          // Can't preload for expression mode - use smart display
          await registerSmartDisplayProperties();
          return;
        default:
          await registerSmartDisplayProperties();
          return;
      }

      if (formToLoad) {
        // Load form by ID
        try {
          const formConfig = await getForm({ formId: formToLoad, configurationItemMode, skipCache: false });
          if (formConfig) {
            const extractedFields = extractFieldsFromFormConfig(formConfig);
            if (extractedFields.length > 0) {
              await registerExtractedFields(extractedFields);
              if (isDesignMode) {
                console.warn(`DataList (${props.id}): Preloaded form template and extracted ${extractedFields.length} fields:`, extractedFields);
              }
              return;
            }
          }
        } catch (error) {
          if (isDesignMode) {
            console.warn(`DataList (${props.id}): Failed to preload form by ID:`, error);
          }
        }
      } else if (formTypeToLoad && modelType) {
        // Load form by entity type and form type
        try {
          const formId = await getEntityFormId(modelType, formTypeToLoad);
          const formConfig = await getForm({ formId, configurationItemMode, skipCache: false });
          if (formConfig) {
            const extractedFields = extractFieldsFromFormConfig(formConfig);
            if (extractedFields.length > 0) {
              await registerExtractedFields(extractedFields);
              if (isDesignMode) {
                console.warn(`DataList (${props.id}): Preloaded form template by type and extracted ${extractedFields.length} fields:`, extractedFields);
              }
              return;
            }
          }
        } catch (error) {
          if (isDesignMode) {
            console.warn(`DataList (${props.id}): Failed to preload form by type:`, error);
          }
        }
      }

      // If preloading failed, fall back to smart display
      await registerSmartDisplayProperties();
    } catch (error) {
      console.error(`DataList: Error in form template preloading:`, error);
      await registerFallbackProperties();
    }
  }, [props.formSelectionMode, props.formId, props.formType, modelType, hasRegisteredFields, registerExtractedFields, registerSmartDisplayProperties, registerFallbackProperties, getForm, getEntityFormId, configurationItemMode, isDesignMode, props.id]);

  // Handle fields extracted from form template (for runtime extraction)
  const handleFieldsExtracted = useCallback((fields: string[], formConfig: any) => {
    // Only handle runtime extraction if we haven't already registered fields from preloading
    if (hasRegisteredFields) {
      if (isDesignMode) {
        console.warn(`DataList (${props.id}): Fields already registered from preloading, skipping runtime extraction`);
      }
      return;
    }

    if (fields.length > 0) {
      setExtractedFields(fields);
      registerExtractedFields(fields).catch(error => {
        console.error('Failed to register extracted fields:', error);
      });

      if (isDesignMode) {
        console.warn(`DataList (${props.id}): Runtime form template analysis complete. Extracted ${fields.length} fields from form configuration:`, fields);
      }
    } else {
      // If no fields extracted, use smart display
      registerSmartDisplayProperties().catch(error => {
        console.error('Failed to register smart display properties:', error);
      });
    }
  }, [registerExtractedFields, registerSmartDisplayProperties, isDesignMode, props.id, hasRegisteredFields]);

  // Effect to preload form template and extract fields early
  React.useEffect(() => {
    if (modelType && !hasRegisteredFields) {
      preloadFormTemplate().catch(error => {
        console.error('Failed to preload form template:', error);
      });
    }
  }, [modelType, preloadFormTemplate, hasRegisteredFields]);

  // Effect to register fallback properties when modelType changes and no fields have been extracted yet
  React.useEffect(() => {
    if (modelType && !hasRegisteredFields && extractedFields.length === 0) {
      // Small delay to allow preloading to happen first
      const timeoutId = setTimeout(() => {
        if (!hasRegisteredFields) {
          registerFallbackProperties().catch(error => {
            console.error('Failed to register fallback properties:', error);
          });
        }
      }, 500); // Increased delay to allow preloading

      return () => clearTimeout(timeoutId);
    }
  }, [modelType, hasRegisteredFields, extractedFields.length, registerFallbackProperties]);

  const dataListProps = useMemo(() => {
    const baseProps = {
      ...props,
      onRowDeleteSuccessAction: props.onRowDeleteSuccessAction,
      style: allStyles.fullStyle as string,
      createFormId: props.createFormId ?? props.formId,
      createFormType: props.createFormType ?? props.formType,
      canAddInline: canAction(canAddInline),
      canEditInline: canAction(canEditInline),
      canDeleteInline: canAction(canDeleteInline),
      noDataIcon,
      noDataSecondaryText,
      noDataText,
      entityType: modelType,
      onSelectRow,
      onMultiSelectRows: setMultiSelectedRow,
      selectedRow,
      selectedRows,
      records: data,
      grouping,
      groupingMetadata: groupingColumns?.map(item => item.metadata) ?? [],
      isFetchingTableData,
      selectedIds,
      changeSelectedIds,
      createAction: creater,
      updateAction: updater,
      deleteAction: deleter,
      actionRef: dataListRef,
      modalWidth: width ?? '60%',
    };

    // If form is missing in design mode, provide default template
    if (isFormMissing) {
      baseProps.formId = { name: 'PersonListTemplate', module: 'Default' };
      baseProps.formSelectionMode = 'name';
      // Also set a mock entity type for better smart display
      if (!baseProps.entityType) {
        baseProps.entityType = 'Person';
      }
    }

    // Add the field extraction callback
    (baseProps as any).onFieldsExtracted = handleFieldsExtracted;

    return baseProps;
  }, [props, isFormMissing, canAddInline, canEditInline, canDeleteInline, data, selectedRow, selectedRows, handleFieldsExtracted]);

  if (groupingColumns?.length > 0 && orientation === "wrap") {
    return <EmptyState noDataText='Configuration Error' noDataSecondaryText='Wrap Orientation is not supported when Grouping is enabled.' />;
  }

  return (
    <ConfigurableFormItem
      model={{ ...props, hideLabel: true }}
      className={classNames(
        styles.shaDatalistComponent,
        { horizontal: props?.orientation === 'horizontal' && allData.form?.formMode !== 'designer' } //
      )}
      wrapperCol={{ md: 24 }}
    >

      <DataList {...dataListProps} />
    </ConfigurableFormItem>
  );
};

export default DataListControl;