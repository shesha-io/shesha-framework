import React, { FC, useCallback, useMemo, useRef, useState, useEffect } from 'react';
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
import { IPropertyMetadata, YesNoInherit } from '@/interfaces';
import { EmptyState } from '@/components';
import { IFormApi } from '@/providers/form/formApi';
import { useMetadataDispatcher } from '@/providers';
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
      if (isDesignMode) {
        console.log(`DataList (${props.id}): Called requireColumns() to activate columns functionality for data fetching`);
      }
    }
  }, [requireColumns, isDesignMode, props.id]);

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
    // Use real data from the data context
    if (isDesignMode && tableData) {
      console.log(`DataList (${props.id}): Using real data from context:`, {
        recordCount: tableData.length,
        firstRecordKeys: tableData.length > 0 ? Object.keys(tableData[0]) : [],
        sampleRecord: tableData.length > 0 ? tableData[0] : null,
        modelType: modelType
      });
    }
    return tableData;
  }, [tableData, isDesignMode, modelType, props.id]);

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

  const width = props.modalWidth === 'custom' && props.customWidth ? `${props.customWidth}${props.widthUnits}` : props.modalWidth;


  // Deep search function to find all propertyName values in nested objects
  const findAllPropertyNames = useCallback((obj: any, path: string = ''): Array<{ path: string, propertyName: string, fullObject?: any }> => {
    const results: Array<{ path: string, propertyName: string, fullObject?: any }> = [];

    const searchRecursively = (current: any, currentPath: string) => {
      if (!current || typeof current !== 'object') return;

      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          searchRecursively(item, `${currentPath}[${index}]`);
        });
      } else {
        // Check if current object has propertyName
        if (current.hasOwnProperty('propertyName') && current.propertyName) {
          results.push({
            path: currentPath || 'root',
            propertyName: current.propertyName,
            fullObject: current
          });
        }

        // Recursively search all properties
        Object.keys(current).forEach(key => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          searchRecursively(current[key], newPath);
        });
      }
    };

    searchRecursively(obj, path);
    return results;
  }, []);

  // State to track field registration status and discovered property names
  const [hasRegisteredFields, setHasRegisteredFields] = useState(false);
  const [discoveredPropertyNames, setDiscoveredPropertyNames] = useState<string[]>([]);



  // Filter discovered property names against entity metadata and register valid ones
  const validateAndRegisterDiscoveredFields = useCallback(async () => {
    if (!discoveredPropertyNames.length || !modelType || !registerConfigurableColumns || hasRegisteredFields) {
      return;
    }

    try {
      // Always include 'id' field as it's essential for DataList functionality
      // Ensure all field names are strings and filter out any invalid values
      const validPropertyNames = discoveredPropertyNames.filter(f => typeof f === 'string' && f.length > 0 && f !== 'id');
      let fieldsToValidate = ['id', ...validPropertyNames];

      // Validate fields against entity metadata if available
      try {
        const metadata = await metadataDispatcher.getMetadata({
          dataType: DataTypes.entityReference,
          modelType: modelType
        });

        if (metadata?.properties && Array.isArray(metadata.properties)) {
          // Extract the 'path' field from each property object - these are the actual entity column names
          const availableEntityColumns = metadata.properties.map(prop => prop.path).filter(Boolean);
          const validEntityFields: string[] = [];
          const invalidFormFields: string[] = [];

          if (isDesignMode) {
            console.log(`DataList (${modelType}): Entity has ${availableEntityColumns.length} available columns:`, availableEntityColumns);
            console.log(`DataList (${modelType}): Form has ${fieldsToValidate.length} property references:`, fieldsToValidate);
            console.log(`DataList (${modelType}): Full entity metadata:`, metadata);
          }

          fieldsToValidate.forEach(field => {
            // Skip invalid field values
            if (typeof field !== 'string' || !field.length) {
              if (isDesignMode) {
                console.warn(`DataList (${modelType}): Skipping invalid field:`, field);
              }
              return;
            }

            // For nested properties like 'person.firstName', check if 'person' exists as entity column
            const topLevelProperty = field.split('.')[0];

            // Check if the field matches any of the entity column paths (case-insensitive for better matching)
            const matchingColumn = availableEntityColumns.find(col =>
              col.toLowerCase() === field.toLowerCase() ||
              col.toLowerCase() === topLevelProperty.toLowerCase()
            );

            if (matchingColumn) {
              // Use the exact column name from metadata for consistency
              validEntityFields.push(matchingColumn);
            } else {
              invalidFormFields.push(field);
            }
          });

          if (invalidFormFields.length > 0 && isDesignMode) {
            console.warn(`DataList (${modelType}): Found ${invalidFormFields.length} form fields that don't match entity columns:`, {
              invalidFormFields,
              availableEntityColumns,
              note: "These form fields reference properties that don't exist on the entity"
            });
          }

          if (validEntityFields.length > 0) {
            // Use the validated entity fields (the matched ones) for registration
            fieldsToValidate = validEntityFields;

            if (isDesignMode) {
              console.log(`DataList (${modelType}): Successfully matched ${validEntityFields.length} form fields to entity columns:`, {
                matchedFields: validEntityFields,
                skippedFormFields: invalidFormFields,
                totalEntityColumns: availableEntityColumns.length,
                totalFormFields: discoveredPropertyNames.length
              });
            }

            // Create virtual columns for the MATCHED/VALIDATED fields only
            const virtualColumns = validEntityFields.map((propertyName, index) => ({
              id: `datalist_matched_${propertyName}`,
              propertyName: propertyName,
              caption: propertyName,
              itemType: 'item' as const,
              sortOrder: index,
              isVisible: false, // Hidden columns, only for field fetching
              columnType: 'data' as const,
              propertiesToFetch: [propertyName], // Array format like DataTable uses
            }));

            // Register the matched fields as virtual columns
            registerConfigurableColumns(`datalist_matched_${props.id}`, virtualColumns);
            setHasRegisteredFields(true);

            if (isDesignMode) {
              console.log(`DataList (${modelType}): Successfully registered ${validEntityFields.length} MATCHED entity fields for optimized fetching:`, {
                registeredFields: validEntityFields,
                registeredColumns: virtualColumns,
                ownerId: `datalist_matched_${props.id}`
              });
            }
            return; // Exit early since we successfully registered matched fields
          } else {
            // If no valid fields found, log error
            if (isDesignMode) {
              console.error(`DataList (${modelType}): No form fields match any entity columns. Please check form field bindings against entity properties:`, {
                formFields: discoveredPropertyNames,
                entityColumns: availableEntityColumns
              });
            }
            return;
          }
        } else {
          if (isDesignMode) {
            console.warn(`DataList (${modelType}): Entity metadata not available, using discovered fields without validation`);
          }
        }
      } catch (metadataError) {
        if (isDesignMode) {
          console.warn(`DataList (${modelType}): Failed to get entity metadata for field validation:`, metadataError);
        }
      }

      // If we reach here, no entity metadata validation occurred, fallback to using discovered fields
      if (isDesignMode) {
        console.warn(`DataList (${modelType}): Using discovered fields without entity validation (no metadata available):`, fieldsToValidate);
      }

      // Create virtual columns for discovered fields (fallback when no entity metadata)
      const virtualColumns = fieldsToValidate.map((propertyName, index) => ({
        id: `datalist_discovered_${propertyName}`,
        propertyName: propertyName,
        caption: propertyName,
        itemType: 'item' as const,
        sortOrder: index,
        isVisible: false, // Hidden columns, only for field fetching
        columnType: 'data' as const,
        propertiesToFetch: [propertyName], // Array format like DataTable uses
      }));

      // Register discovered fields as virtual columns (fallback)
      registerConfigurableColumns(`datalist_discovered_${props.id}`, virtualColumns);
      setHasRegisteredFields(true);

      if (isDesignMode) {
        console.log(`DataList (${modelType}): Registered ${fieldsToValidate.length} discovered fields (without entity validation):`, {
          registeredFields: fieldsToValidate,
          registeredColumns: virtualColumns,
          ownerId: `datalist_discovered_${props.id}`
        });
      }
    } catch (error) {
      console.error(`DataList: Failed to validate and register discovered fields for ${modelType}:`, error);
    }
  }, [discoveredPropertyNames, modelType, registerConfigurableColumns, hasRegisteredFields, metadataDispatcher, isDesignMode, props.id]);


  // Preload form template to extract fields early (before data fetching)
  const preloadFormTemplate = useCallback(async () => {
    if (!modelType || hasRegisteredFields) return;

    // Check if we have a form configured
    const hasFormConfigured =
      (props.formSelectionMode === 'name' && props.formId) ||
      (props.formSelectionMode === 'view' && props.formType) ||
      props.formSelectionMode === 'expression';

    if (!hasFormConfigured) {
      // No form configured - use auto display mode with entity metadata
      if (!modelType) {
        if (isDesignMode) {
          console.error(`DataList (${props.id}): No form configured and no entity type specified. Cannot use auto display mode.`);
        }
        return;
      }

      // Auto display mode: discover entity properties automatically
      try {
        const entityMetadata = await metadataDispatcher.getMetadata({
          dataType: DataTypes.entityReference,
          modelType: modelType
        });

        if (entityMetadata?.properties && entityMetadata.properties.length > 0) {
          // Get basic displayable properties (exclude complex navigation properties for now)
          const basicProperties = (entityMetadata.properties as IPropertyMetadata[])
            .filter(prop =>
              prop.dataType !== 'entity-reference' && // Skip navigation properties for auto mode
              prop.dataType !== 'object' && // Skip complex objects
              !prop.path.includes('.') && // Skip nested properties
              prop.path !== 'id' // Skip ID field unless explicitly needed
            )
            .slice(0, 6) // Limit to first 6 properties for auto display
            .map(prop => prop.path);

          if (basicProperties.length > 0) {
            // Create virtual columns for auto-discovered properties
            const virtualColumns = basicProperties.map((propertyName, index) => ({
              id: `datalist_auto_${propertyName}`,
              propertyName: propertyName,
              caption: propertyName,
              itemType: 'item' as const,
              sortOrder: index,
              isVisible: false, // Hidden columns, only for field fetching
              columnType: 'data' as const,
              propertiesToFetch: [propertyName], // Array format like DataTable uses
            }));

            // Register auto-discovered fields as virtual columns
            registerConfigurableColumns(`datalist_auto_${props.id}`, virtualColumns);
            setHasRegisteredFields(true);

            if (isDesignMode) {
              console.log(`DataList (${props.id}): Auto display mode - registered ${basicProperties.length} entity properties:`, {
                registeredFields: basicProperties,
                registeredColumns: virtualColumns,
                entityType: modelType,
                ownerId: `datalist_auto_${props.id}`
              });
            }
            return;
          }
        }

        // If no suitable properties found for auto display
        if (isDesignMode) {
          console.warn(`DataList (${props.id}): Auto display mode failed - no suitable properties found in entity metadata for "${modelType}"`);
        }
        return;

      } catch (error) {
        if (isDesignMode) {
          console.error(`DataList (${props.id}): Auto display mode failed - could not fetch entity metadata for "${modelType}":`, error);
        }
        return;
      }
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
          // Can't preload for expression mode - will extract fields at runtime
          if (isDesignMode) {
            console.warn(`DataList (${props.id}): Expression mode selected - fields will be extracted at runtime`);
          }
          return;
        default:
          if (isDesignMode) {
            console.error(`DataList (${props.id}): Unknown form selection mode. Please configure a valid form selection mode.`);
          }
          return;
      }

      if (formToLoad) {
        // Load form by ID
        try {
          const formResult = await getForm({ formId: formToLoad, skipCache: false });
          if (formResult) {
            // Deep search for all propertyName values
            const allPropertyNames = findAllPropertyNames(formResult);
            const uniquePropertyNames = [...new Set(allPropertyNames.map(item => item.propertyName))];

            // Save discovered property names to state
            setDiscoveredPropertyNames(uniquePropertyNames);

            if (isDesignMode) {
              console.log(`DataList (${props.id}): Deep search found ${allPropertyNames.length} propertyName entries:`, {
                propertyNames: allPropertyNames.map(item => item.propertyName),
                detailedResults: allPropertyNames,
                uniquePropertyNames: uniquePropertyNames
              });
            }
          }
        } catch (error) {
          if (isDesignMode) {
            console.warn(`DataList (${props.id}): Failed to load form by ID "${formToLoad}":`, error);
          }
        }
      } else if (formTypeToLoad && modelType) {
        // Load form by entity type and form type
        try {
          const formId = await getEntityFormId(modelType, formTypeToLoad);
          const formResult = await getForm({ formId, skipCache: false });
          if (formResult) {
            // Deep search for all propertyName values
            const allPropertyNames = findAllPropertyNames(formResult);
            const uniquePropertyNames = [...new Set(allPropertyNames.map(item => item.propertyName))];

            // Save discovered property names to state
            setDiscoveredPropertyNames(uniquePropertyNames);

            if (isDesignMode) {
              console.log(`DataList (${props.id}): Deep search found ${allPropertyNames.length} propertyName entries for entity "${modelType}" with form type "${formTypeToLoad}":`, {
                formId: formId,
                propertyNames: allPropertyNames.map(item => item.propertyName),
                detailedResults: allPropertyNames,
                uniquePropertyNames: uniquePropertyNames
              });
            }
            const extractedFields = extractFieldsFromFormConfig(formResult);
            if (isDesignMode) {
              console.log(`DataList (${props.id}): Field extraction result from entity form:`, {
                extractedFields,
                extractedFieldsCount: extractedFields.length,
                modelType: modelType,
                formType: formTypeToLoad
              });
            }
            if (extractedFields.length > 0) {
              if (isDesignMode) {
                console.log(`DataList (${props.id}): Preloaded form template by type and extracted ${extractedFields.length} fields (will be validated via discovered fields):`, extractedFields);
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

      // If preloading failed, log error and rely on runtime extraction
      if (isDesignMode) {
        console.error(`DataList (${props.id}): Form template preloading failed. Fields will need to be extracted at runtime or form configuration must be corrected.`);
      }
    } catch (error) {
      console.error(`DataList: Error in form template preloading:`, error);
    }
  }, [props.formSelectionMode, props.formId, props.formType, modelType, hasRegisteredFields, getForm, getEntityFormId, isDesignMode, props.id]);

  // Handle fields extracted from form template (for runtime extraction)
  const handleFieldsExtracted = useCallback((fields: string[], formConfig: any) => {
    // Allow runtime extraction even if fields were registered before (form config might have changed)
    if (hasRegisteredFields) {
      if (isDesignMode) {
        console.log(`DataList (${props.id}): Handling runtime field extraction (form config may have changed)`);
      }
    }

    // Deep search for all propertyName values in runtime form
    const allPropertyNames = findAllPropertyNames(formConfig);
    const uniquePropertyNames = [...new Set(allPropertyNames.map(item => item.propertyName))];

    // If we previously had registered fields and form changed, reset registration status
    if (hasRegisteredFields) {
      setHasRegisteredFields(false);
    }

    // Save discovered property names to state for comparison with entity metadata
    setDiscoveredPropertyNames(uniquePropertyNames);

    if (isDesignMode) {
      console.log(`DataList (${props.id}): Runtime deep search found ${allPropertyNames.length} propertyName entries:`, {
        propertyNames: allPropertyNames.map(item => item.propertyName),
        detailedResults: allPropertyNames,
        uniquePropertyNames: uniquePropertyNames
      });
    }

    if (fields.length > 0) {
      if (isDesignMode) {
        console.log(`DataList (${props.id}): Runtime field extraction found ${fields.length} fields (will be validated via discovered fields):`, fields);
      }
      // Note: No longer registering here - fields will be validated and registered via validateAndRegisterDiscoveredFields
    } else {
      // If no fields extracted, require proper form configuration
      if (isDesignMode) {
        console.error(`DataList (${props.id}): No fields extracted from form template. Please ensure the form contains valid field references.`);
      }
    }
  }, [isDesignMode, props.id, hasRegisteredFields, modelType]);

  // Effect to reset field registration when form configuration changes
  useEffect(() => {
    // Reset when key form configuration properties change
    setHasRegisteredFields(false);
    setDiscoveredPropertyNames([]);
  }, [props.formId, props.formType, props.formSelectionMode, modelType, props.id, isDesignMode]);

  // Effect to preload form template and extract fields early
  useEffect(() => {
    if (modelType && !hasRegisteredFields) {
      preloadFormTemplate().catch(error => {
        console.error('Failed to preload form template:', error);
      });
    }
  }, [modelType, preloadFormTemplate, hasRegisteredFields]);

  // Effect to validate and register discovered property names
  useEffect(() => {
    if (discoveredPropertyNames.length > 0 && modelType && !hasRegisteredFields) {
      validateAndRegisterDiscoveredFields().catch(error => {
        console.error('Failed to validate and register discovered fields:', error);
      });
    }
  }, [discoveredPropertyNames, modelType, hasRegisteredFields, validateAndRegisterDiscoveredFields]);


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

    // Add the field extraction callback
    (baseProps as any).onFieldsExtracted = handleFieldsExtracted;

    return baseProps;
  }, [props, canAddInline, canEditInline, canDeleteInline, data, selectedRow, selectedRows, handleFieldsExtracted]);

  if (groupingColumns?.length > 0 && orientation === "wrap") {
    return <EmptyState noDataText='Configuration Error' noDataSecondaryText='Wrap Orientation is not supported when Grouping is enabled.' />;
  }

  return (
    <ConfigurableFormItem
      model={{ ...props, hideLabel: true }}
      className={classNames(
        styles.shaDatalistComponent,
        { horizontal: props?.orientation === 'horizontal' }
      )}
      wrapperCol={{ md: 24 }}
    >

      <DataList {...dataListProps} />
    </ConfigurableFormItem>
  );
};

export default DataListControl;