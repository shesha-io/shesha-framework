/* eslint @typescript-eslint/no-use-before-define: 0 */
import { Alert, Checkbox, Collapse, Divider, Typography } from 'antd';
import classNames from 'classnames';
import React, { FC, useEffect, useState, useRef, MutableRefObject } from 'react';
import { useMeasure, usePrevious } from 'react-use';
import { FormFullName, FormIdentifier, IFormDto, IPersistedFormProps, useAppConfigurator, useConfigurableActionDispatcher, useShaFormInstance } from '@/providers';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import ConditionalWrap from '@/components/conditionalWrapper';
import FormInfo from '../configurableForm/formInfo';
import ShaSpin from '@/components/shaSpin';
import Show from '@/components/show';
import { GroupLevelInfo, GroupLevels, IDataListProps, NewItemInitializer, Row, RowOrGroup, RowsGroup } from './models';
import { useAvailableConstantsData, executeScriptSync, getStyle, isFormFullName } from '@/providers/form/utils';
import { isEqual } from 'lodash';
import { useDeepCompareMemo } from '@/hooks';
import { ValueRenderer } from '@/components/valueRenderer/index';
import { toCamelCase } from '@/utils/string';
import { DataListItemRenderer } from './itemRenderer';
import DataListItemCreateModal from './createModal';
import { useMemo } from 'react';
import moment from 'moment';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useStyles } from './styles/styles';
import { EmptyState } from "..";
import AttributeDecorator from '../attributeDecorator';

interface EntityForm {
  entityType: string;
  isFetchingFormId?: boolean;
  formId: FormIdentifier;
  formType?: string;
  isFetchingFormConfiguration?: boolean;
  formConfiguration: IFormDto;
}

export const DataList: FC<Partial<IDataListProps>> = ({
  id,
  formId,
  formType,
  createFormId,
  createFormType,
  formSelectionMode,
  formIdExpression,
  selectionMode,
  selectedRow,
  selectedRows,
  onSelectRow,
  onMultiSelectRows,
  onSelectedIdsChanged,
  records,
  isFetchingTableData,
  entityType,
  selectedIds,
  changeSelectedIds,
  orientation,
  listItemWidth,
  customListItemWidth,
  grouping,
  groupingMetadata,
  collapsible,
  collapseByDefault,
  groupStyle,
  canAddInline,
  canEditInline,
  canDeleteInline,
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
  cardMaxWidth = '350px',
  cardMinWidth = '350px',
  showBorder,
  cardSpacing,
  ...props
}) => {

  const { styles } = useStyles();
  //const refreshRef = useRef(0);

  let skipCache = false;
  /*const now = new Date().valueOf();
  if ((now - refreshRef.current) > 5000) {
    skipCache = true;
    refreshRef.current = now;
  }*/

  interface IFormIdDictionary {
    [key: string]: Promise<FormFullName>;
  }

  const loadedFormId = useRef<IFormIdDictionary>({});
  if (skipCache)
    loadedFormId.current = {};

  const entityForms = useRef<EntityForm[]>([]);
  const entityFormInfo = useRef<EntityForm>();
  const createFormInfo = useRef<EntityForm>();

  const [content, setContent] = useState<React.JSX.Element[]>(null);
  const rows = useRef<React.JSX.Element[]>(null);

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
  const { configurationItemMode } = useAppConfigurator();
  const { executeAction, useActionDynamicContext } = useConfigurableActionDispatcher();

  const dynamicContext = useActionDynamicContext(props.dblClickActionConfiguration);

  const computedGroupStyle = getStyle(groupStyle, allData.data) ?? {};

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const onSelectRowLocal = (index: number, row: any) => {
    if (selectionMode === 'none') return;

    if (selectionMode === 'multiple') {
      let selected = [...selectedIds];
      if (selectedIds.find((x) => x === row?.id)) selected = selected.filter((x) => x !== row?.id);
      else selected = [...selected, row?.id];
      changeSelectedIds(selected);
      onMultiSelectRows(
        records?.map((item: any, index) => {
          return { isSelected: Boolean(selected.find((x) => x === item?.id)), index, id: item?.id, original: item };
        })
      );
    } else {
      if (onSelectRow ?? typeof onSelectRow === 'function') onSelectRow(index, row);
    }
  };

  const onSelectAllRowsLocal = (val: Boolean) => {
    changeSelectedIds(
      val
        ? records?.map((item: any) => {
          return item?.id;
        })
        : []
    );
    onMultiSelectRows(
      records?.map((item: any, index) => {
        return { isSelected: val, index, id: item?.id, original: item };
      })
    );
  };

  const previousIds = usePrevious(selectedIds);

  useEffect(() => {
    if (!(previousIds?.length === 0 && selectedIds?.length === 0) && typeof onSelectedIdsChanged === 'function') {
      onSelectedIdsChanged(selectedIds);
    }
  }, [selectedIds]);

  useEffect(() => {
    if (!isFetchingTableData && records?.length && props.onFetchDataSuccess) props.onFetchDataSuccess();
  }, [isFetchingTableData]);

  const { getEntityFormId, getForm } = useConfigurationItemsLoader();

  const getFormIdFromExpression = (item): FormFullName => {
    if (!formIdExpression) return null;

    return executeScriptSync(formIdExpression, { ...allData, item });
  };

  const { formInfoBlockVisible } = useAppConfigurator();

  const persistedFormProps = entityFormInfo.current?.formConfiguration;

  const persistedCreateFormProps = createFormInfo.current?.formConfiguration;

  const [measuredRef, measured] = useMeasure();
  const [itemWidthCalc, setItemWidth] = useState({});

  // TODO: Horisontal orientation works incorrect under Container with Display = `grid`

  //The below forces the card to use max-width, therefore avoiding the issue of having cards
  //with varying sizes. This is only a problem when selection mode is not "none"

  if (orientation === "wrap" && selectionMode !== "none") {
    cardMinWidth = cardMaxWidth;
  }

  useEffect(() => {
    if (measured?.width === 0) return;
    let res = null;
    if (orientation === "horizontal" && listItemWidth !== 'custom') {
      res = ({ width: '100%', minWidth: listItemWidth as unknown as number * 100 + '%' } as React.CSSProperties);

    } else if (orientation === "horizontal" && listItemWidth === "custom") {
      res = ({ width: `${customListItemWidth}px` } as React.CSSProperties);

    } else if (orientation === 'vertical' || !listItemWidth || (listItemWidth === 'custom' && !customListItemWidth)) {
      res =
        selectionMode === 'none'
          ? ({ width: '100%' } as React.CSSProperties)
          : ({ width: 'calc(100% - 0px)' } as React.CSSProperties);
    } else {
      res =
        listItemWidth === 'custom'
          ? ({ width: `${customListItemWidth}px` } as React.CSSProperties)
          : { width: `${(measured?.width - 40) * listItemWidth - (selectionMode === 'none' ? 0 : 28)}px` };
    }

    setItemWidth(res);
  }, [measured?.width, listItemWidth, customListItemWidth, orientation]);

  const isReady = (forms: EntityForm[]) => {
    if (!(!forms || forms.length === 0 || forms.find(x => !x.formConfiguration))) {
      updateRows();
      updateContent();
    }
  };

  const getEntityForm = (className: string, fId: FormIdentifier, fType: string, entityFormInfo: MutableRefObject<EntityForm>): boolean => {
    let entityForm = entityForms.current.find((x) => x.entityType === className && x.formType === fType);
    if (!entityForm) {
      entityForm = {
        entityType: className,
        formId: fId,
        formConfiguration: null,
        formType: fType,
      };
      entityForms.current.push(entityForm);
      if (!entityFormInfo?.current)
        entityFormInfo.current = entityForm;
    } else
      return !!entityForm.formConfiguration;

    if (!!entityForm.formId) {
      getForm({ formId: entityForm.formId, configurationItemMode, skipCache })
        .then(response => {
          entityForm.formConfiguration = response;
          isReady(entityForms.current);
        });
    } else {

      const f = loadedFormId.current[`${entityForm.entityType}_${fType}`]
        ?? getEntityFormId(entityForm.entityType, fType);

      f.then((e) =>
        getForm({ formId: e, configurationItemMode, skipCache })
          .then(response => {
            entityForm.formId = e;
            entityForm.formConfiguration = response;
            isReady(entityForms.current);
          })
      );

      loadedFormId.current[`${entityForm.entityType}_${fType}`] = f;
    };
    return false;
  };

  useDeepCompareEffect(() => {
    let isReady = true;

    let fId = createFormId;
    let className = '$createFormName$';
    let fType = null;
    if (formSelectionMode === 'view') {
      fId = null;
      className = entityType ?? '$createFormName$';
      fType = !!createFormType ? createFormType : null;
    }
    if (!!fId || !!fType)
      isReady = getEntityForm(className, fId, fType, createFormInfo) && isReady;

    records.forEach((item) => {
      let fId = null;
      let className = null;
      let fType = null;
      if (formSelectionMode === 'name') {
        className = '$formName$';
        fId = formId;
      }
      if (formSelectionMode === 'view') {
        fType = !!formType ? formType : null;
        className = entityType ?? item?._className;
      }
      if (formSelectionMode === 'expression') {
        fId = getFormIdFromExpression(item);
      }
      if (!!fId || !!fType)
        isReady = getEntityForm(className, fId, fType, entityFormInfo) && isReady;
    });

    // we don't need to wait form requests if all form is ready
    if (isReady) {
      updateRows();
      updateContent();
    }
  }, [records, formId, formType, createFormId, createFormType, entityType, formSelectionMode, canEditInline, canDeleteInline, noDataIcon, noDataSecondaryText, noDataText]);

  const renderSubForm = (item: any, index: number) => {
    let className = null;
    let fType = null;
    if (formSelectionMode === 'name') {
      className = '$formName$';
    }
    if (formSelectionMode === 'view') {
      className = entityType ?? item?._className;
      fType = formType;
    }

    let entityForm = entityForms.current.find((x) => x.entityType === className && x.formType === fType);

    if (!entityForm?.formConfiguration?.markup)
      return <Alert className="sha-designer-warning" message="Form configuration not found" type="warning" />;

    const dblClick = () => {
      if (props.dblClickActionConfiguration) {
        // TODO: implement generic context collector
        const evaluationContext = {
          ...allData,
          selectedRow: item,
          ...dynamicContext
        };
        executeAction({
          actionConfiguration: props.dblClickActionConfiguration,
          argumentsEvaluationContext: evaluationContext,
        });
      } else console.error('Action is not configured');
      return false;
    };

    const attributes = {
      'data-sha-datalist-item-type': 'subForm',
      'data-sha-parent-form-id': `${shaForm?.form?.id}`,
      'data-sha-parent-form-name': `${shaForm?.form?.module}/${shaForm?.form?.name}`,
      'data-sha-form-id': `${entityForm?.formConfiguration?.id}`,
    };

    if (isFormFullName(entityForm?.formId))
      attributes['data-sha-form-name'] = `${entityForm?.formId.module}/${entityForm?.formId.name}`;

    return (
      <AttributeDecorator attributes={attributes}>
        <div onDoubleClick={dblClick}>
          <DataListItemRenderer
            isNewObject={false}
            markup={entityForm?.formConfiguration?.markup}
            formSettings={entityForm?.formConfiguration?.settings}
            data={item}
            listId={id}
            listName='Data List'
            itemIndex={index}
            itemId={item['id']}
            allowEdit={canEditInline}
            allowDelete={canDeleteInline}
            updater={(rowData) => updateAction(index, rowData)}
            deleter={() => deleteAction(index, item)}
            allowChangeEditMode={inlineEditMode === 'one-by-one'}
            editMode={canEditInline && inlineEditMode === 'all-at-once' ? 'update' : 'read'}
            autoSave={inlineSaveMode === 'auto'}
          />
        </div>
      </AttributeDecorator>
    );
  };

  const isGroup = (item: RowOrGroup): item is RowsGroup => {
    return item && Array.isArray((item as RowsGroup).$childs);
  };

  const groups = useDeepCompareMemo(() => {
    if (grouping?.length > 0) {
      const groupLevels: GroupLevels = grouping.map<GroupLevelInfo>((g, index) => ({
        currentGroup: null,
        propertyName: g.propertyName,
        index: index,
        propertyPath: g.propertyName.split('.')
      }));

      const getValue = (container: object, path: string[]) => {
        return path.reduce((prev, part) => prev ? prev[part] : undefined, container);
      };

      const result: RowsGroup[] = [];
      records.forEach((row, rowIndex) => {
        let parent: RowOrGroup[] = result;
        let differenceFound = false;
        groupLevels.forEach((g, index) => {
          const groupValue = getValue(row, g.propertyPath);

          if (!g.currentGroup || !isEqual(g.currentGroup.value, groupValue) || differenceFound) {
            g.currentGroup = {
              index: index,
              value: groupValue,
              $childs: []
            };
            parent.push(g.currentGroup);
            differenceFound = true;
          }
          parent = g.currentGroup.$childs;
        });
        parent.push({ index: rowIndex, row } as Row);
      });
      return result;
    }

    return null;
  }, [records, grouping, groupingMetadata]);

  const renderGroupTitle = (value: any, propertyName: string, style: React.CSSProperties) => {
    if (!Boolean(value) && value !== false) {
      if (!!style)
        return <Typography.Text style={style}>(empty)</Typography.Text>;
      else
        return <Typography.Text type='secondary'>(empty)</Typography.Text>;
    }
    const propertyMeta = groupingMetadata.find(p => toCamelCase(p.path) === propertyName);
    return <Typography.Text style={style}><ValueRenderer value={value} meta={propertyMeta} /></Typography.Text>;
  };

  const renderGroup = (group: RowsGroup, key: number): React.ReactElement => {
    const title = renderGroupTitle(group.value, grouping[group.index].propertyName, computedGroupStyle);
    return (
      <Collapse
        key={key}
        defaultActiveKey={collapseByDefault ? [] : ['1']}
        expandIconPosition='start'
        className={`sha-group-level-${group.index}`}
        collapsible={collapsible ? undefined : 'disabled'}
        style={computedGroupStyle}
      >
        <Collapse.Panel header={<span style={computedGroupStyle}>{title}</span>} key="1" style={computedGroupStyle}>
          {group.$childs.map((child, index, records) => {
            return isGroup(child)
              ? renderGroup(child, index)
              : renderRow(child.row, child.index, records?.length - 1 === index);
          })}
        </Collapse.Panel>
      </Collapse>
    );
  };

  const renderRow = (item: any, index: number, isLastItem: Boolean) => {

    const selected =
      selectedRow?.index === index && !(selectedRows?.length > 0) ||
      (selectedRows?.length > 0 && selectedRows?.some(({ id }) => id === item?.id));
    return (
      <div>
        <ConditionalWrap
          condition={selectionMode !== 'none'}
          wrap={(children) => (
            <Checkbox
              className={classNames(styles.shaDatalistComponentItemCheckbox, { selected })}
              checked={selected}
              onChange={() => {
                onSelectRowLocal(index, item);
              }}>
              {children}
            </Checkbox>
          )}
        >
          <div
            className={classNames(orientation === 'wrap' ? styles.shaDatalistCard : styles.shaDatalistComponentItem, { selected })}
            onClick={() => {
              onSelectRowLocal(index, item);
            }}
            style={orientation === 'wrap' ? {
              minWidth: `${Number(cardMinWidth) ? cardMinWidth + 'px' : cardMinWidth}`, maxWidth: `${Number(cardMaxWidth) ? cardMaxWidth + 'px' : cardMaxWidth}`, height: `${Number(cardHeight) ? cardHeight + 'px' : cardHeight}`,
              ...(showBorder && { border: '1px #d3d3d3 solid' })
            } : itemWidthCalc}
          >
            {rows.current?.length > index ? rows.current[index] : null}
          </div>
        </ConditionalWrap>{' '}
        {(orientation !== "wrap" && (!isLastItem) && <Divider className={classNames(styles.shaDatalistComponentDivider, { selected })} />)}
      </div>
    );
  };

  const onCreateClick = () => {
    if (canAddInline)
      setCreateModalOpen(true);
  };
  if (actionRef?.current)
    actionRef.current.addNewItem = onCreateClick;

  const onNewListItemInitializeExecuter = useMemo<Function>(() => {
    return props.onNewListItemInitialize
      ? new Function('form, contexts, globalState, contexts, http, moment', props.onNewListItemInitialize)
      : null;
  }, [props.onNewListItemInitialize]);

  const onNewListItemInitialize = useMemo<NewItemInitializer>(() => {
    return () => Promise.resolve(
      props.onNewListItemInitialize
        ? onNewListItemInitializeExecuter(allData.form, allData.contexts ?? {}, allData.globalState, allData.contexts, allData.http, moment)
        : {}
    );
  }, [onNewListItemInitializeExecuter, allData.data, allData.globalState, allData.contexts.lastUpdate]);


  const updateRows = () => {
    rows.current = records?.map((item: any, index) => renderSubForm(item, index));
  };

  const updateContent = () => {
    setContent(groups
      ? groups?.map((item: RowsGroup, index) => renderGroup(item, index))
      : records?.map((item: any, index) => renderRow(item, index, records?.length - 1 === index))
    );
  };

  return (
    <>
      {createModalOpen && createFormInfo?.current?.formConfiguration &&
        <DataListItemCreateModal
          id={id}
          formInfo={persistedCreateFormProps}
          markup={createFormInfo?.current?.formConfiguration.markup}
          formSettings={createFormInfo?.current?.formConfiguration.settings}
          creater={createAction}
          onToggle={(isOpen) => setCreateModalOpen(isOpen)}
          data={onNewListItemInitialize}
          width={props.modalWidth}
        />
      }
      <div>
        <Show when={selectionMode === 'multiple'} >
          <Checkbox
            onChange={(e) => {
              onSelectAllRowsLocal(e.target.checked);
            }}
            checked={selectedRows?.length === records?.length && records?.length > 0}
            indeterminate={selectedRows?.length !== records?.length && selectedRows?.length > 0}
          >
            Select All
          </Checkbox>
          <Divider />
        </Show>
        {// Use Configurable Action
        /*<Show when={canAddInline}>
          <Button 
            type='link' 
            shape="round" 
            title='Add new item' 
            icon={<PlusCircleOutlined />} 
            className="sha-link"
            onClick={onCreateClick}
          >
            Add new item...
          </Button>
        </Show>*/}
      </div>
      <FormInfo visible={formInfoBlockVisible} formProps={{ ...(persistedFormProps as IPersistedFormProps) }}>
        <ShaSpin spinning={isFetchingTableData} tip={isFetchingTableData ? 'Loading...' : 'Submitting...'}>
          <div
            key="spin_key"
            ref={measuredRef}
            className={classNames(styles.shaDatalistComponentBody, {
              loading: isFetchingTableData && records?.length === 0,
              horizontal: orientation === 'horizontal',
            })}
          >

            <Show when={records?.length === 0}>
              <EmptyState noDataIcon={noDataIcon} noDataSecondaryText={noDataSecondaryText} noDataText={noDataText} />
            </Show>

            <Show when={records?.length > 0}>
              {orientation === "wrap" &&
                <div className={styles.shaDatalistWrapParent} style={{ gap: `${cardSpacing}`, gridTemplateColumns: `repeat(auto-fit, minmax(${cardMinWidth}, 1fr))` }}>
                  {content}
                </div>
              }

              {orientation === "horizontal" &&
                <div className={styles.shaDatalistHorizontal}>
                  {React.Children.map(content, child => {
                    return React.cloneElement(child, { style: itemWidthCalc });
                  })}
                </div>
              }

              {orientation === "vertical" &&
                <div style={itemWidthCalc}>
                  {React.Children.map(content, child => {
                    return React.cloneElement(child, { style: itemWidthCalc });
                  })}
                </div>
              }

            </Show>
          </div>
        </ShaSpin>
      </FormInfo>
    </>
  );
};
