/* eslint @typescript-eslint/no-use-before-define: 0 */
import { Button, Checkbox, Collapse, Divider, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { FC, useEffect, useState, useRef, RefObject, CSSProperties, ReactElement, useMemo, ReactNode } from 'react';
import { usePrevious } from 'react-use';
import { DEFAULT_FORM_SETTINGS, FormFullName, FormIdentifier, HttpClientApi, IFormDto, IPersistedFormProps, useAppConfigurator, useConfigurableActionDispatcher, useShaFormInstance } from '@/providers';
import { ConfigurableItemIdentifierToString } from '@/interfaces/configurableItems';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import ConditionalWrap from '@/components/conditionalWrapper';
import FormInfo from '../configurableForm/formInfo';
import ShaSpin from '@/components/shaSpin';
import Show from '@/components/show';
import { GroupLevelInfo, GroupLevels, IDataListProps, NewItemInitializer, GrouppedRow, RowOrGroup, RowsGroup } from './models';
import { useAvailableConstantsData, executeScriptSync, getStyle, isFormFullName, formDtop2PersistedFormProps } from '@/providers/form/utils';
import { isEqual } from 'lodash';
import { useDeepCompareMemo } from '@/hooks';
import { ValueRenderer } from '@/components/valueRenderer/index';
import { toCamelCase } from '@/utils/string';
import { DataListItemRenderer } from './itemRenderer';
import DataListItemCreateModal from './createModal';
import moment from 'moment';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useStyles } from './styles/styles';
import { EmptyState } from "..";
import AttributeDecorator from '../attributeDecorator';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { getEntityTypeName, isEntityTypeIdEqual } from '@/providers/metadataDispatcher/entities/utils';
import { ConfigurationLoadingError } from '@/providers/configurationItemsLoader/errors';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { ITableRowData, RowSelection } from '@/providers/dataTable/interfaces';
import { IFormApi } from '@/providers/form/formApi';
import { IDataContextsData } from '@/providers/dataContextManager/models';
import { IAnyObject } from '@/interfaces';
import { getClassNameOrUndefined } from '@/utils/entity';
import { getNestedPropertyValueByPath } from '@/utils/dotnotation';
import { jsonSafeParse } from '@/utils/object';

interface EntityForm {
  entityType: string | IEntityTypeIdentifier;
  isFetchingFormId?: boolean;
  formId: FormIdentifier | undefined;
  formType?: string | undefined;
  isFetchingFormConfiguration?: boolean | undefined;
  formConfiguration: IFormDto | undefined | null;
}

const EMPTY_SELECTED_ROWS: ITableRowData[] = [];
const EMPTY_SELDECTED_IDS: string[] = [];
const EMPTY_RECORDS: ITableRowData[] = [];

type EntityFormAttributeNames = 'data-sha-datalist-item-type' | 'data-sha-parent-form-id' | 'data-sha-parent-form-name' | 'data-sha-form-id' | 'data-sha-form-name';
type EntityFormAttribute = Partial<Record<EntityFormAttributeNames, string>>;

export const DataList: FC<IDataListProps> = ({
  id,
  formId,
  formType,
  createFormId,
  createFormType,
  formSelectionMode,
  formIdExpression,
  selectionMode,
  selectedRow,
  selectedRows = EMPTY_SELECTED_ROWS,
  onSelectRow,
  onClearSelectedRow,
  onMultiSelectRows,
  onSelectedIdsChanged,
  records = EMPTY_RECORDS,
  isFetchingTableData,
  entityType,
  selectedIds = EMPTY_SELDECTED_IDS,
  changeSelectedIds,
  orientation = 'vertical',
  grouping,
  groupingMetadata,
  collapsible,
  collapseByDefault,
  groupStyle,
  canAddInline = false,
  canEditInline = false,
  canDeleteInline = false,
  createAction,
  updateAction,
  deleteAction,
  inlineEditMode,
  inlineSaveMode,
  actionRef,
  noDataIcon,
  noDataSecondaryText,
  noDataText,
  cardHeight,
  showBorder,
  cardSpacing,
  style,
  showEditIcons = true,
  gap,
  onRowDeleteSuccessAction,
  onListItemClick,
  onListItemHover,
  onListItemSelect,
  onSelectionChange,
  ...props
}) => {
  const { styles, theme } = useStyles();

  let skipCache = false;

  interface IFormIdDictionary {
    [key: string]: Promise<FormFullName>;
  }

  const stylesAsCSS = isDefined(style) ? jsonSafeParse<CSSProperties>(style) ?? {} : {};

  const loadedFormId = useRef<IFormIdDictionary>({});
  if (skipCache)
    loadedFormId.current = {};

  const entityForms = useRef<EntityForm[]>([]);
  const entityFormInfo = useRef<EntityForm>(undefined);
  const createFormInfo = useRef<EntityForm>(undefined);

  const [content, setContent] = useState<React.JSX.Element[]>([]);
  const rows = useRef<ReactNode[]>([]);

  const shaForm = useShaFormInstance();

  useDeepCompareEffect(() => {
    entityForms.current = [];
    entityFormInfo.current = undefined;
    createFormInfo.current = undefined;
  }, [formId, formType, createFormId, createFormType, entityType, formSelectionMode]);

  useDeepCompareEffect(() => {
    updateContent();
  }, [selectedRow, selectedRows, selectionMode]);

  const allData = useAvailableConstantsData();
  const { executeAction, useActionDynamicContext } = useConfigurableActionDispatcher();

  const dynamicContext = useActionDynamicContext(props.dblClickActionConfiguration);

  const computedGroupStyle = getStyle(groupStyle, allData.data) ?? {};

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const onSelectRowLocal = (index: number, row: ITableRowData): void => {
    if (selectionMode === 'none') return;

    if (selectionMode === 'multiple') {
      let selected = [...selectedIds];
      const wasSelected = selectedIds.find((x) => x === row.id);

      if (wasSelected) {
        // Deselecting - don't trigger onListItemSelect
        selected = selected.filter((x) => x !== row.id);
      } else {
        // Selecting - trigger onListItemSelect event
        if (onListItemSelect) {
          onListItemSelect(index, row);
        }
        selected = [...selected, row.id];
      }

      changeSelectedIds(selected);

      const updatedSelection = records.map<RowSelection<ITableRowData>>((item, index) => {
        return { isSelected: Boolean(selected.find((x) => x === item.id)), index, id: item.id, original: item };
      });

      onMultiSelectRows(updatedSelection);

      // Trigger onSelectionChange event
      if (onSelectionChange) {
        const selectedItems = records.filter((item) => selected.includes(item.id));
        const selectedIndices = records.map((item, idx) => selected.includes(item.id) ? idx : -1).filter((idx) => idx !== -1);
        onSelectionChange(selectedItems, selectedIndices);
      }
    } else {
      // Single selection mode
      const isCurrentlySelected = selectedRow?.index === index;

      if (isCurrentlySelected) {
        // Deselecting - don't trigger onListItemSelect
        if (onClearSelectedRow) onClearSelectedRow();

        // Trigger onSelectionChange event for deselection
        if (onSelectionChange) {
          onSelectionChange([], []);
        }
      } else {
        // Selecting - trigger onListItemSelect event
        if (onListItemSelect) {
          onListItemSelect(index, row);
        }

        if (onSelectRow ?? typeof onSelectRow === 'function') onSelectRow(index, row);

        // Trigger onSelectionChange event for single selection
        if (onSelectionChange) {
          onSelectionChange([row], [index]);
        }
      }
    }
  };

  const onSelectAllRowsLocal = (val: boolean): void => {
    const newSelectedIds = val
      ? records.map((item) => {
        return item.id;
      })
      : [];

    changeSelectedIds(newSelectedIds);

    const updatedSelection = records.map((item, index) => {
      return { isSelected: val, index, id: item.id, original: item };
    });

    onMultiSelectRows(updatedSelection);

    // Trigger onSelectionChange event
    if (onSelectionChange) {
      const selectedItems = val ? records : [];
      const selectedIndices = val ? records.map((_, index) => index) : [];
      onSelectionChange(selectedItems, selectedIndices);
    }
  };

  const previousIds = usePrevious(selectedIds);

  useEffect(() => {
    if (!(previousIds?.length === 0 && selectedIds.length === 0) && typeof onSelectedIdsChanged === 'function') {
      onSelectedIdsChanged(selectedIds);
    }
    // TODO V1: move to events
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  useEffect(() => {
    if (!isFetchingTableData && records.length && props.onFetchDataSuccess) props.onFetchDataSuccess();
    // TODO V1: move to events
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingTableData]);

  const { getEntityFormIdAsync, getFormAsync } = useConfigurationItemsLoader();

  const getFormIdFromExpression = (item: ITableRowData): FormFullName | undefined => {
    if (!formIdExpression) return undefined;

    return executeScriptSync(formIdExpression, { ...allData, item });
  };

  const { formInfoBlockVisible } = useAppConfigurator();

  const persistedFormProps = entityFormInfo.current?.formConfiguration;

  const persistedCreateFormProps = createFormInfo.current?.formConfiguration;

  const fcContainerStyles = useFormComponentStyles({ ...props.container ?? {} });

  const isReady = (forms: EntityForm[]): void => {
    // Check if all forms have finished loading (either successfully or with an error)
    // A form is considered "loaded" when formConfiguration is not undefined
    // (it can be null if there was an error, or a valid object if successful)
    const allFormsProcessed = forms.every((x) => x.formConfiguration !== undefined);

    if (allFormsProcessed) {
      updateRows();
      updateContent();
    }
  };

  const isValidFormId = (formId: FormIdentifier): boolean => {
    if (!formId) return false;

    // If it's a string, it should not be empty
    if (typeof formId === 'string') {
      const isValid = formId.trim().length > 0;
      if (!isValid) {
        console.warn('Invalid formId: empty string');
      }
      return isValid;
    }

    // If it's an object (FormFullName), it should have both name and module
    if (typeof formId === 'object') {
      const hasName = !isNullOrWhiteSpace(formId.name);
      const hasModule = !isNullOrWhiteSpace(formId.module);
      const isValid = hasName && hasModule;

      if (!isValid) {
        console.warn('Invalid formId object:', {
          name: formId.name,
          module: formId.module,
          hasName,
          hasModule,
        });
      }

      return isValid;
    }

    return false;
  };

  const getEntityForm = (entityType: string | IEntityTypeIdentifier, fId: FormIdentifier | undefined, fType: string | undefined, entityFormInfo: RefObject<EntityForm | undefined>): boolean => {
    let entityForm = entityForms.current.find((x) => x.formType === fType && isEntityTypeIdEqual(x.entityType, entityType));
    if (!entityForm) {
      entityForm = {
        entityType: typeof entityType === 'string' ? entityType : { ...entityType },
        formId: fId,
        formConfiguration: undefined, // undefined means "not yet loaded", null means "failed to load"
        formType: fType,
      };
      entityForms.current.push(entityForm);
      if (!entityFormInfo.current)
        entityFormInfo.current = entityForm;
    } else
      return entityForm.formConfiguration !== undefined; // Return true if already processed (either loaded or failed)

    if (isDefined(entityForm.formId) && isValidFormId(entityForm.formId)) {
      getFormAsync({ formId: entityForm.formId, skipCache })
        .then((response) => {
          entityForm.formConfiguration = response;
          isReady(entityForms.current);
        })
        .catch((error) => {
          if (error instanceof ConfigurationLoadingError) {
            console.error('Configuration loading error:', error.message, error.details);
          } else {
            console.error('Failed to load form configuration:', error);
          }
          // Set formConfiguration to null so it shows the "Form Not Found" placeholder
          entityForm.formConfiguration = null;
          isReady(entityForms.current);
        });
    } else if (isDefined(entityForm.formId) && !isValidFormId(entityForm.formId)) {
      // FormId exists but is invalid - don't attempt to fetch
      console.warn('Invalid formId provided to DataList:', entityForm.formId);
      entityForm.formConfiguration = null;
      isReady(entityForms.current);
    } else {
      const entityTypeKey = getEntityTypeName(entityForm.entityType) ?? '';
      const cacheKey = `${entityTypeKey}_${fType ?? ''}`;
      const f = loadedFormId.current[cacheKey] ?? getEntityFormIdAsync(entityForm.entityType, fType ?? "");

      f.then((e) =>
        getFormAsync({ formId: e, skipCache })
          .then((response) => {
            entityForm.formId = e;
            entityForm.formConfiguration = response;
            isReady(entityForms.current);
          })
          .catch((error) => {
            if (error instanceof ConfigurationLoadingError) {
              console.error('Configuration loading error:', error.message, error.details);
            } else {
              console.error('Failed to load form configuration:', error);
            }
            // Set formConfiguration to null so it shows the "Form Not Found" placeholder
            entityForm.formConfiguration = null;
            isReady(entityForms.current);
          }),
      ).catch((error) => {
        if (error instanceof ConfigurationLoadingError) {
          console.error('Configuration loading error (form ID):', error.message, error.details);
        } else {
          console.error('Failed to get form ID:', error);
        }
        // Set formConfiguration to null so it shows the "Form Not Found" placeholder
        entityForm.formConfiguration = null;
        isReady(entityForms.current);
      });

      loadedFormId.current[`${entityForm.entityType}_${fType}`] = f;
    };
    return false;
  };

  useDeepCompareEffect(() => {
    let isReady = true;

    let fId = createFormId;
    let formEntityType: string | IEntityTypeIdentifier = '$createFormName$';
    let fType: string | undefined = undefined;
    if (formSelectionMode === 'view') {
      fId = undefined;
      formEntityType = entityType ?? '$createFormName$';
      fType = !!createFormType ? createFormType : undefined;
    }
    if (isDefined(fId) || isDefined(fType))
      isReady = getEntityForm(formEntityType, fId, fType, createFormInfo) && isReady;

    records.forEach((item) => {
      let fId: FormIdentifier | undefined = undefined;
      let formEntityType: string | IEntityTypeIdentifier | undefined = undefined;
      let fType: string | undefined = undefined;
      if (formSelectionMode === 'name') {
        formEntityType = '$formName$';
        fId = formId;
      }
      if (formSelectionMode === 'view') {
        fType = !!formType ? formType : undefined;
        formEntityType = entityType ?? getClassNameOrUndefined(item);
      }
      if (formSelectionMode === 'expression') {
        fId = getFormIdFromExpression(item);
        // Use the form ID itself as the entity type to ensure unique caching per form
        formEntityType = fId ? ConfigurableItemIdentifierToString(fId) : '$expressionForm$';
      }
      if (isDefined(formEntityType) && (isDefined(fId) || isDefined(fType)))
        isReady = getEntityForm(formEntityType, fId, fType, entityFormInfo) && isReady;
    });

    // we don't need to wait form requests if all form is ready
    if (isReady) {
      updateRows();
      updateContent();
    }
  }, [records, formId, formType, createFormId, createFormType, entityType, formSelectionMode, showEditIcons, canEditInline, canDeleteInline, noDataIcon, noDataSecondaryText, noDataText, style, groupStyle, orientation]);

  const renderSubForm = (item: ITableRowData, index: number): ReactNode => {
    let formEntityType = null;
    let fType = null;
    if (formSelectionMode === 'name') {
      formEntityType = '$formName$';
    }
    if (formSelectionMode === 'view') {
      formEntityType = entityType ?? getClassNameOrUndefined(item);
      fType = formType;
    }
    if (formSelectionMode === 'expression') {
      const expressionFormId = getFormIdFromExpression(item);
      formEntityType = expressionFormId ? ConfigurableItemIdentifierToString(expressionFormId) : '$expressionForm$';
    }

    const entityForm = entityForms.current.find((x) => isDefined(formEntityType) && isEntityTypeIdEqual(x.entityType, formEntityType) && x.formType === fType);

    if (!isDefined(entityForm) || !isDefined(entityForm.formConfiguration?.markup)) {
      const isDesignMode = allData.form?.formMode === 'designer';

      // In runtime mode, don't render anything if form is not configured
      if (!isDesignMode) {
        return null;
      }

      // In designer mode, show placeholder matching DataListPlaceholder style
      // Validation errors are now handled by validateModel and useComponentValidation at the component level
      // This placeholder is shown for items when the form is not configured
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: theme.colorBgContainer,
            borderTop: `1px solid ${theme.colorBorder}`,
            borderBottom: `1px solid ${theme.colorBorder}`,
          }}
        >
          {/* Icon placeholder */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: theme.colorFillSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '18px',
              color: theme.colorTextQuaternary,
            }}
          >
            👤
          </div>
          {/* Text content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 500,
                fontSize: '14px',
                color: theme.colorTextSecondary,
                marginBottom: '4px',
              }}
            >
              Heading
            </div>
            <div
              style={{
                fontSize: '12px',
                color: theme.colorTextTertiary,
              }}
            >
              Subtext
            </div>
          </div>
        </div>
      );
    }

    const dblClick = (): boolean => {
      if (props.dblClickActionConfiguration) {
        // TODO: implement generic context collector
        const evaluationContext = {
          ...allData,
          selectedRow: item,
          ...dynamicContext,
        };
        void executeAction({
          actionConfiguration: props.dblClickActionConfiguration,
          argumentsEvaluationContext: evaluationContext,
        });
      } else console.error('Action is not configured');
      return false;
    };

    const attributes: EntityFormAttribute = {
      'data-sha-datalist-item-type': 'subForm',
      'data-sha-parent-form-id': `${shaForm.form?.id}`,
      'data-sha-parent-form-name': `${shaForm.form?.module}/${shaForm.form?.name}`,
      'data-sha-form-id': `${entityForm.formConfiguration.id}`,
    };

    if (isFormFullName(entityForm.formId))
      attributes['data-sha-form-name'] = `${entityForm.formId.module}/${entityForm.formId.name}`;

    return (
      <AttributeDecorator attributes={attributes}>
        <div onDoubleClick={dblClick}>
          <DataListItemRenderer
            isNewObject={false}
            markup={entityForm.formConfiguration.markup}
            formSettings={entityForm.formConfiguration.settings ?? DEFAULT_FORM_SETTINGS}
            data={item}
            listId={id}
            listName="Data List"
            itemIndex={index}
            itemId={item['id']}
            allowEdit={showEditIcons && canEditInline}
            allowDelete={canDeleteInline}
            updater={updateAction ? (rowData) => updateAction(index, rowData) : undefined}
            deleter={deleteAction ? () => deleteAction(index, item) : undefined}
            allowChangeEditMode={inlineEditMode === 'one-by-one'}
            editMode={canEditInline && inlineEditMode === 'all-at-once' ? 'update' : 'read'}
            autoSave={inlineSaveMode === 'auto'}
          />
        </div>
      </AttributeDecorator>
    );
  };

  const isGroup = (item: RowOrGroup): item is RowsGroup => {
    return isDefined(item) && Array.isArray((item as RowsGroup).$childs);
  };

  const groups = useDeepCompareMemo(() => {
    if (isDefined(grouping) && grouping.length > 0) {
      const groupLevels: GroupLevels = grouping.map<GroupLevelInfo>((g, index) => ({
        currentGroup: undefined,
        propertyName: g.propertyName,
        index: index,
        propertyPath: g.propertyName.split('.'),
      }));

      const result: RowsGroup[] = [];
      records.forEach((row, rowIndex) => {
        let parent: RowOrGroup[] = result;
        let differenceFound = false;
        groupLevels.forEach((g, index) => {
          const groupValue = getNestedPropertyValueByPath(row, g.propertyPath);

          if (!g.currentGroup || !isEqual(g.currentGroup.value, groupValue) || differenceFound) {
            g.currentGroup = {
              index: index,
              value: groupValue,
              $childs: [],
            };
            parent.push(g.currentGroup);
            differenceFound = true;
          }
          parent = g.currentGroup.$childs;
        });
        parent.push({ index: rowIndex, row } as GrouppedRow);
      });
      return result;
    }

    return null;
  }, [records, grouping, groupingMetadata]);

  const renderGroupTitle = (value: unknown, propertyName: string, style: React.CSSProperties): ReactElement => {
    if (!Boolean(value) && value !== false) {
      if (isDefined(style))
        return <Typography.Text style={style}>(empty)</Typography.Text>;
      else
        return <Typography.Text type="secondary">(empty)</Typography.Text>;
    }
    const propertyMeta = groupingMetadata.find((p) => toCamelCase(p.path) === propertyName);
    return <Typography.Text style={style}><ValueRenderer value={value} meta={propertyMeta} /></Typography.Text>;
  };

  const renderGroup = (group: RowsGroup, key: number): React.ReactElement => {
    if (!isDefined(grouping))
      throw new Error('Grouping is not defined');

    const groupInfo = grouping[group.index];
    const title = isDefined(groupInfo)
      ? renderGroupTitle(group.value, groupInfo.propertyName, computedGroupStyle)
      : "unknown group";
    return (
      <Collapse
        key={key}
        defaultActiveKey={collapseByDefault ? [] : ['1']}
        expandIconPlacement="start"
        className={`sha-group-level-${group.index}`}
        {...(collapsible ? {} : { collapsible: 'disabled' })}
        style={computedGroupStyle}
      >
        <Collapse.Panel header={<span style={computedGroupStyle}>{title}</span>} key="1" style={computedGroupStyle}>
          {group.$childs.map((child, index, records) => {
            return isGroup(child)
              ? renderGroup(child, index)
              : renderRow(child.row, child.index, records.length - 1 === index);
          })}
        </Collapse.Panel>
      </Collapse>
    );
  };


  const renderRow = (item: ITableRowData, index: number, isLastItem: boolean): ReactElement => {
    const hasBorder = (): boolean => {
      const borderProps: (keyof CSSProperties)[] = ['border', 'borderWidth', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight'];
      return borderProps.some((prop) => {
        const value = stylesAsCSS[prop];
        return value && value !== 'none' && value !== '0' && value !== '0px';
      });
    };

    const selected = isDefined(selectedRow) && (
      (selectedRow.index === index && !(selectedRows.length > 0)) ||
      (selectedRows.length > 0 && selectedRows.some(({ id }) => id === item?.id))
    );


    const itemStyles: CSSProperties = {
      ...(stylesAsCSS),
      ...(orientation === 'horizontal' && { flexShrink: 0 }),
      ...(orientation === 'wrap' && showBorder && {
        border: '1px solid #d3d3d3',
        borderRadius: '8px',
      }),
      ...(orientation !== 'wrap' && {
        marginTop: gap !== undefined ? (typeof gap === 'number' ? `${gap}px` : gap) : '0px',
      }),
    };

    return (
      <div key={`row-${index}`}>
        <ConditionalWrap
          condition={selectionMode === 'multiple'}
          wrap={(children) => (
            <Checkbox
              className={classNames(styles.shaDatalistComponentItemCheckbox, { selected })}
              checked={selected}
              onChange={() => {
                onSelectRowLocal(index, item);
              }}
            >
              {children}
            </Checkbox>
          )}
        >
          <div
            className={classNames(
              orientation === 'wrap' ? styles.shaDatalistCard : styles.shaDatalistComponentItem,
              { selected },
            )}
            onClick={() => {
              // For single and multiple selection modes, trigger selection when clicking on row
              if (selectionMode === 'single' || selectionMode === 'multiple') {
                onSelectRowLocal(index, item);
              }
              // Trigger onListItemClick event
              if (onListItemClick) {
                onListItemClick(index, item);
              }
            }}
            onMouseEnter={() => {
              // Trigger onListItemHover event
              if (onListItemHover) {
                onListItemHover(index, item);
              }
            }}
            style={{ ...itemStyles, width: orientation === 'wrap' ? 'unset' : itemStyles.width, overflow: 'auto' }}
          >
            {rows.current.length > index ? rows.current[index] : null}
          </div>
        </ConditionalWrap>
        {(orientation !== "wrap" && (!isLastItem) && !hasBorder() && gap === undefined && (
          <Divider
            style={{ margin: '10px', width: itemStyles.width }}
            className={classNames(styles.shaDatalistComponentDivider, { selected })}
          />
        ))}
      </div>
    );
  };

  const onCreateClick = (): void => {
    if (canAddInline)
      setCreateModalOpen(true);
  };
  if (actionRef?.current)
    actionRef.current.addNewItem = onCreateClick;

  type MomentType = typeof moment;
  type NewListItemInitExecuter = (form: IFormApi | undefined, contexts: IDataContextsData | object, globalState: IAnyObject | undefined, http: HttpClientApi, moment: MomentType) => ITableRowData;
  const onNewListItemInitializeExecuter = useMemo<NewListItemInitExecuter | undefined>(() => {
    return props.onNewListItemInitialize
      ? new Function('form, contexts, globalState, contexts, http, moment', props.onNewListItemInitialize) as NewListItemInitExecuter
      : undefined;
  }, [props.onNewListItemInitialize]);

  const onNewListItemInitialize = useMemo<NewItemInitializer<ITableRowData>>(() => {
    return () => Promise.resolve(
      onNewListItemInitializeExecuter
        ? onNewListItemInitializeExecuter(allData.form, allData.contexts ?? {}, allData.globalState, allData.http, moment)
        : {} as ITableRowData,
    );
  }, [onNewListItemInitializeExecuter, allData.form, allData.contexts, allData.globalState, allData.http]);

  const updateRows = (): void => {
    rows.current = records.map((item, index) => renderSubForm(item, index));
  };

  const updateContent = (): void => {
    setContent(groups
      ? groups.map((item, index) => renderGroup(item, index))
      : records.map((item, index) => renderRow(item, index, records.length - 1 === index)),
    );
  };


  const getContainerStyles = (): CSSProperties => {
    const containerStyles: CSSProperties = {
      gap: gap !== undefined ? (typeof gap === 'number' ? `${gap}px` : gap) : '0px',
      ...fcContainerStyles.jsStyle,
      ...fcContainerStyles.stylingBoxAsCSS,
      ...fcContainerStyles.dimensionsStyles,
    };

    const rawItemWidth =
      stylesAsCSS.width ?? props.container?.dimensions?.width;
    const itemWidth =
      rawItemWidth !== undefined
        ? typeof rawItemWidth === 'number'
          ? `${rawItemWidth}px`
          : rawItemWidth
        : '300px';

    switch (orientation) {
      case 'horizontal':
        return {
          ...containerStyles,
          display: 'flex',
          gridAutoFlow: 'row',
          gridAutoColumns: 'max-content',
          alignItems: 'start',
        };

      case 'wrap':
        return {
          ...containerStyles,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, ${itemWidth})`,
          alignItems: 'start',
        };

      case 'vertical':
      default:
        return {
          ...containerStyles,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr',
          alignItems: 'stretch',
        };
    }
  };

  return (
    <>
      {createModalOpen && isDefined(persistedCreateFormProps) && (
        <DataListItemCreateModal<ITableRowData>
          formInfo={formDtop2PersistedFormProps(persistedCreateFormProps)}
          markup={persistedCreateFormProps.markup ?? []}
          formSettings={persistedCreateFormProps.settings ?? DEFAULT_FORM_SETTINGS}
          creater={createAction}
          onToggle={(isOpen) => setCreateModalOpen(isOpen)}
          data={onNewListItemInitialize}
          width={props.modalWidth}
        />
      )}
      <div>
        <Show when={selectionMode === 'multiple'}>
          <Checkbox
            onChange={(e) => {
              onSelectAllRowsLocal(e.target.checked);
            }}
            checked={selectedRows.length === records.length && records.length > 0}
            indeterminate={selectedRows.length !== records.length && selectedRows.length > 0}
          >
            Select All
          </Checkbox>
          <Divider />
        </Show>
        <Show when={canAddInline}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateClick}
            style={{ marginLeft: '2px' }}
          >
            Add New Item
          </Button>
        </Show>
      </div>
      <FormInfo visible={formInfoBlockVisible} formProps={{ ...(persistedFormProps as IPersistedFormProps) }}>
        <ShaSpin spinning={isFetchingTableData} tip={isFetchingTableData ? 'Loading...' : 'Submitting...'}>
          <div
            key="spin_key"
            style={getContainerStyles()}
            className={classNames(styles.shaDatalistComponentBody, {
              loading: isFetchingTableData && records.length === 0,
              horizontal: orientation === 'horizontal',
              wrap: orientation === 'wrap',
              vertical: orientation === 'vertical',
            })}
          >
            <Show when={records.length === 0}>
              <EmptyState
                noDataIcon={noDataIcon}
                noDataSecondaryText={noDataSecondaryText}
                noDataText={noDataText}
              />
            </Show>

            <Show when={records.length > 0}>
              {React.Children.map(content, (child, index) => {
                const childProps: object = isDefined(child.props) && typeof (child.props) === "object"
                  ? child.props as object
                  : {};
                const childStyle = "style" in childProps && isDefined(childProps.style) && typeof (childProps.style) === "object"
                  ? childProps.style as CSSProperties
                  : {};
                return React.cloneElement(child, {
                  key: child.key || index,
                  style: {
                    ...childStyle,
                    overflow: 'visible',
                    flex: '0 0 100%',
                  },
                });
              })}
            </Show>
          </div>
        </ShaSpin>
      </FormInfo>
    </>
  );
};
