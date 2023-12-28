import { Alert, Checkbox, Collapse, Divider, Typography } from 'antd';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { useMeasure, usePrevious } from 'react-use';
import { FormFullName, IFormDto, IPersistedFormProps, useAppConfigurator, useConfigurableActionDispatcher, useSheshaApplication } from '@/providers';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { getFormConfiguration, getMarkupFromResponse } from '@/providers/form/api';
import ConditionalWrap from '@/components/conditionalWrapper';
import FormInfo from '../configurableForm/formInfo';
import ShaSpin from '@/components/shaSpin';
import Show from '@/components/show';
import { IDataListProps, NewItemInitializer } from './models';
import { asFormRawId, asFormFullName, useApplicationContext, executeScriptSync, getStyle } from '@/providers/form/utils';
import './styles/index.less';
import { isEqual } from 'lodash';
import { useDeepCompareMemo } from '@/hooks';
import { ValueRenderer } from '@/components/valueRenderer/index';
import { toCamelCase } from '@/utils/string';
import { DataListItemRenderer } from './itemRenderer';
import DataListItemCreateModal from './createModal';
import { useMemo } from 'react';
import { axiosHttp } from '@/index';
import moment from 'moment';

interface EntityForm {
  entityType: string;
  isFetchingFormId: boolean;
  formId: FormFullName;
  isFetchingFormConfiguration: boolean;
  formConfiguration: IFormDto;
}

export const DataList: FC<Partial<IDataListProps>> = ({
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
  ...props
}) => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const allData = useApplicationContext();
  const { executeAction } = useConfigurableActionDispatcher();

  const computedGroupStyle = getStyle(groupStyle, allData.data) ?? {};

  const [entityForms, setEntityForms] = useState<EntityForm[]>([]);
  const [formConfigs, setFormConfigs] = useState<IFormDto[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [formConfigInfo, setFormConfigInfo] = useState<IFormDto>();
  const [createFormConfigInfo, setCreateFormConfigInfo] = useState<IFormDto>();

  const [createEntityForm, setCreateEntityForm] = useState<EntityForm>();
  //const [createFormConfig, setCreateFormConfig] = useState<IFormDto>();
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

  const { getEntityFormId } = useConfigurationItemsLoader();

  useEffect(() => {
    if (formSelectionMode === 'expression') setEntityForms([]);
  }, [records]);

  useEffect(() => {
    setEntityForms([]);
  }, [formType, formSelectionMode, formIdExpression]);

  const getFormIdFromExpression = (item): FormFullName => {
    if (!formIdExpression) return null;

    return executeScriptSync(formIdExpression, {...allData, item});
  };

  const { formInfoBlockVisible } = useAppConfigurator();

  const showFormInfo = Boolean(formConfigInfo) && formInfoBlockVisible;
  const persistedFormProps: IPersistedFormProps = {
    id: formConfigInfo?.id,
    module: formConfigInfo?.module,
    versionNo: formConfigInfo?.versionNo,
    description: formConfigInfo?.description,
    versionStatus: formConfigInfo?.versionStatus,
    name: formConfigInfo?.name,
  };

  const showCreateFormInfo = Boolean(createFormConfigInfo) && formInfoBlockVisible;
  const persistedCreateFormProps: IPersistedFormProps = {
    id: createFormConfigInfo?.id,
    module: createFormConfigInfo?.module,
    versionNo: createFormConfigInfo?.versionNo,
    description: createFormConfigInfo?.description,
    versionStatus: createFormConfigInfo?.versionStatus,
    name: createFormConfigInfo?.name,
  };

  const [measuredRef, measured] = useMeasure();
  const [itemWidthCalc, setItemWidth] = useState({});

  // ToDo: Horisontal orientation works incorrect under Container with Display = `grid`

  useEffect(() => {
    if (measured?.width === 0) return;
    let res = null;
    if (orientation === 'vertical' || !listItemWidth || (listItemWidth === 'custom' && !customListItemWidth)) {
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

  const updateEntityForms = (entityForm: EntityForm) => {
    if (!formConfigInfo)
      setFormConfigInfo(entityForm.formConfiguration);
    setEntityForms((prev) =>
      prev.map((x) => {
        return x.entityType === entityForm.entityType ? entityForm : x;
      })
    );
  };

  const getFormConfig = (entityForm: EntityForm, updater: (entityForm: EntityForm) => void) => {
    entityForm.isFetchingFormConfiguration = true;
    getFormConfiguration(entityForm.formId, backendUrl, httpHeaders).then((response) => {
      const markupWithSettings = getMarkupFromResponse(response);
      const formConf = {
        ...response.result,
        markup: markupWithSettings?.components,
        settings: markupWithSettings?.formSettings,
      };
      setFormConfigs((prev) => [...prev, formConf]);
      entityForm.isFetchingFormConfiguration = false;
      entityForm.formConfiguration = formConf;
      updater(entityForm);
    });
  };

  const getEntityFormIdInternal = (entityForm: EntityForm, formType: string, updater: (entityForm: EntityForm) => void) => {
    entityForm.isFetchingFormId = true;
    getEntityFormId(entityForm.entityType, formType, (formid) => {
      entityForm.formId = formid;
      entityForm.isFetchingFormId = false;
      entityForm.formConfiguration = formConfigs.find((x) => x.name === formid.name && x.module === formid.module);
      if (!Boolean(entityForm.formConfiguration)) getFormConfig(entityForm, updater);
      updater(entityForm);
    });
  };

  /** Make list of entityTypes */
  useEffect(() => {
    if (formSelectionMode === 'name') {
      setEntityTypes(['formName']);
      return;
    }
    if (formSelectionMode === 'expression') {
      const et = [];
      const ef = [...entityForms];
      const fcFetching = [];
      records.forEach((x, index) => {
        const ename = `expression_${index}_${x['id']}`;
        const entityForm = entityForms.find((x) => x.entityType === ename);
        if (!Boolean(entityForm)) {
          const fc = getFormIdFromExpression(x);
          const eForm: EntityForm = {
            entityType: ename,
            formId: fc ?? { name: '', module: '' },
            isFetchingFormId: false,
            isFetchingFormConfiguration: false,
            formConfiguration: Boolean(fc)
              ? formConfigs.find((x) => x.name === fc.name && x.module === fc.module)
              : null,
          };
          if (
            !Boolean(eForm.formConfiguration) &&
            fcFetching.indexOf(`${eForm.formId?.name}_${eForm.formId?.module}`) === -1 &&
            Boolean(eForm.formId?.name)
          ) {
            fcFetching.push(`${eForm.formId?.name}_${eForm.formId?.module}`);
            getFormConfig(eForm, updateEntityForms);
          }
          ef.push(eForm);
        }
        et.push(ename);
      });
      if (entityForms?.length !== ef?.length) setEntityForms(ef);
      setEntityTypes(et);
      return;
    }
    if (Boolean(entityType)) {
      setEntityTypes([entityType]);
      return;
    }

    const et = [];
    records.forEach((x) => {
      if (Boolean((x as any)?._className) && !Boolean(et.find((e) => e === (x as any)?._className))) {
        et.push((x as any)?._className);
      }
    });
    setEntityTypes(et);
  }, [records, entityType, formSelectionMode, formIdExpression, formType, createFormType, formId, createFormId]);

  /** Fetch forms data for all entity types */
  useEffect(() => {
    if (records?.length > 0 || formSelectionMode === 'name') {
      let eForms = [...entityForms];
      let changed = false;
      const fcFetching = [];

        // create from
      let cForm = !!createEntityForm ? {...createEntityForm} : undefined;
      if (Boolean(cForm)) {
        if (cForm.isFetchingFormConfiguration || cForm.isFetchingFormId) {
          return;
        } else if (Boolean(cForm.formConfiguration)) {
          return;
          //const formConfig = entityForm.formConfiguration;
        } else if (Boolean(cForm.formId)) {
          cForm.formConfiguration = formConfigs.find(
            (x) => x.name === cForm.formId.name && x.module === cForm.formId.module
          );
          if (
            !Boolean(cForm.formConfiguration) &&
            fcFetching.indexOf(`${cForm.formId?.name}_${cForm.formId?.module}`) === -1 &&
            Boolean(cForm.formId?.name)
          ) {
            fcFetching.push(`${cForm.formId?.name}_${cForm.formId?.module}`);
            getFormConfig(cForm, (e) => {
              if (!createFormConfigInfo)
                setCreateFormConfigInfo(e.formConfiguration);
              setCreateEntityForm({...e});
            });
          }
          changed = true;
        } else {
          cForm = { ...cForm, isFetchingFormId: cForm.entityType === entityTypes[0] ? true : cForm.isFetchingFormId };
          changed = true;
        }
      } else {
        const cForm: EntityForm = {
          entityType: entityTypes[0],
          formId: formSelectionMode === 'name' ? asFormFullName(createFormId) : undefined,
          isFetchingFormId: false,
          isFetchingFormConfiguration: false,
          formConfiguration: undefined,
        };
        if (!Boolean(cForm.formId)) 
          getEntityFormIdInternal(cForm, createFormType, (e) => setCreateEntityForm({...e}));
        else if (fcFetching.indexOf(`${cForm.formId?.name}_${cForm.formId?.module}`) === -1) {
          fcFetching.push(`${cForm.formId?.name}_${cForm.formId?.module}`);
          getFormConfig(cForm, (e) => {
            if (!createFormConfigInfo)
              setCreateFormConfigInfo(e.formConfiguration);
            setCreateEntityForm({...e});
          });
        }
        changed = true;
      }
      if (changed) setCreateEntityForm(cForm);

      entityTypes.forEach((etype) => {
        if (Boolean(etype)) {
          const eForm = eForms.find((x) => x.entityType === etype);
          // item form
          if (Boolean(eForm)) {
            if (eForm.isFetchingFormConfiguration || eForm.isFetchingFormId) {
              return;
            } else if (Boolean(eForm.formConfiguration)) {
              return;
              //const formConfig = entityForm.formConfiguration;
            } else if (Boolean(eForm.formId)) {
              eForm.formConfiguration = formConfigs.find(
                (x) => x.name === eForm.formId.name && x.module === eForm.formId.module
              );
              if (
                !Boolean(eForm.formConfiguration) &&
                fcFetching.indexOf(`${eForm.formId?.name}_${eForm.formId?.module}`) === -1 &&
                Boolean(eForm.formId?.name)
              ) {
                fcFetching.push(`${eForm.formId?.name}_${eForm.formId?.module}`);
                getFormConfig(eForm, updateEntityForms);
              }
              eForms = eForms.map((x) => {
                return x.entityType === eForm.entityType ? eForm : x;
              });
              changed = true;
            } else {
              eForms = eForms.map((x) => {
                return { ...x, isFetchingFormId: x.entityType === etype ? true : x.isFetchingFormId };
              });
              changed = true;
            }
          } else {
            const eForm: EntityForm = {
              entityType: etype,
              formId: formSelectionMode === 'name' ? asFormFullName(formId) : undefined,
              isFetchingFormId: false,
              isFetchingFormConfiguration: false,
              formConfiguration: undefined,
            };
            if (!Boolean(eForm.formId)) getEntityFormIdInternal(eForm, formType, updateEntityForms);
            else if (fcFetching.indexOf(`${eForm.formId?.name}_${eForm.formId?.module}`) === -1) {
              fcFetching.push(`${eForm.formId?.name}_${eForm.formId?.module}`);
              getFormConfig(eForm, updateEntityForms);
            }
            eForms.push(eForm);
            changed = true;
          }
        }
      });
      if (changed) setEntityForms(eForms);
    }
  }, [entityTypes]);

  /** Rendering subform if exists for each item */
  const renderSubForm = (item: any, index: number) => {
    let values: { [key: string]: any; id: string } = { ...item };

    let formConfig: IFormDto = null; //formConfiguration;

    if (!Boolean(formConfig)) {
      if (formSelectionMode === 'name') {
        const fid = asFormRawId(formId);
        if (Boolean(fid)) {
          formConfig = formConfigs.find((x) => {
            return x.id === fid;
          });
        } else {
          const f = asFormFullName(formId);
          if (!Boolean(f)) return null;
          formConfig = formConfigs.find((x) => {
            return x.name === f.name && x.module === f.module && (!f.version || x.versionNo === f.version);
          });
        }
      }
      if (formSelectionMode === 'view') {
        const className = entityType ?? item?._className;
        if (Boolean(className)) {
          const entityForm = entityForms.find((x) => x.entityType === className);
          if (Boolean(entityForm)) {
            if (entityForm.isFetchingFormConfiguration || entityForm.isFetchingFormId) {
              return null;
            } else if (Boolean(entityForm.formConfiguration)) {
              formConfig = entityForm.formConfiguration;
            } else {
              return null;
            }
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
      if (formSelectionMode === 'expression') {
        const formId = getFormIdFromExpression(item);
        if (!Boolean(formId)) return null;
        formConfig = formConfigs.find((x) => {
          return (
            x.name === formId.name && x.module === formId.module && (!formId.version || x.versionNo === formId.version)
          );
        });
        if (!Boolean(formConfigs)) {
          return null;
        }
      }
    };

    const dblClick = () => {
      if (props.dblClickActionConfiguration) {
        // todo: implement generic context collector
        const evaluationContext = {
          ...allData,
          selectedRow: item,
        };
        executeAction({
          actionConfiguration: props.dblClickActionConfiguration,
          argumentsEvaluationContext: evaluationContext,
        });
      } else console.error('Action is not configured');
      return false;
    };

    if (!formConfig?.markup) 
      return <Alert className="sha-designer-warning" message="Form configuration not found" type="warning" />;

    return (
      <div onDoubleClick={dblClick}>
        <DataListItemRenderer
          isNewObject={false}
          markup={formConfig?.markup}
          formSettings={formConfig?.settings}
          data={values}
          listId='list'
          listName='Data List'
          itemIndex={index}
          itemId={item['id']}
          allowEdit={canEditInline}
          allowDelete={canDeleteInline}
          updater={(rowData) => updateAction(index, rowData)}
          deleter={() => deleteAction(index, values)}        
          allowChangeEditMode={inlineEditMode === 'one-by-one'}
          editMode={canEditInline && inlineEditMode === 'all-at-once' ? 'update' : 'read'}
          autoSave={inlineSaveMode === 'auto'}
          />
      </div>
    );
  };

  type Row = any;
  type RowOrGroup = Row | RowsGroup;
  interface RowsGroup {
    value: any;
    index: number;
    $childs: RowOrGroup[];
  }
  interface GroupLevelInfo {
    propertyName: string;
    index: number;
    currentGroup?: RowsGroup;
    propertyPath: string[];
  }
  type GroupLevels = GroupLevelInfo[];
  const isGroup = (item: RowOrGroup): item is RowsGroup => {
    return item && Array.isArray(item.$childs);
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
      records.forEach(row => {
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
        parent.push(row);
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
              : renderRow(child, index, records?.length - 1 === index);
          })}
        </Collapse.Panel>
      </Collapse>
    );
  };

  const renderRow = (item: any, index: number, isLastItem: Boolean) => {
    const selected =
      selectedRow?.index === index ||
      (selectedRows?.length > 0 && selectedRows?.some(({ id }) => id === item?.id));
    return (
      <div key={item['id'] ?? index}>
        <ConditionalWrap
          condition={selectionMode !== 'none'}
          wrap={(children) => (
            <Checkbox
              className={classNames('sha-datalist-component-item-checkbox', { selected })}
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
            className={classNames('sha-datalist-component-item', { selected })}
            onClick={() => {
              onSelectRowLocal(index, item);
            }}
            style={itemWidthCalc}
          >
            {renderSubForm(item, index)}
          </div>
        </ConditionalWrap>{' '}
        {!isLastItem && <Divider className={classNames('sha-datalist-component-divider', { selected })} />}
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
      ? new Function('formData, contexts, globalState, contexts, http, moment', props.onNewListItemInitialize)
      : null;
  }, [props.onNewListItemInitialize]);

  const onNewListItemInitialize = useMemo<NewItemInitializer>(() => {
    const result: NewItemInitializer = props.onNewListItemInitialize
      ? () => {
        // todo: replace formData and globalState with accessors (e.g. refs) and remove hooks to prevent unneeded re-rendering
        //return onNewRowInitializeExecuter(formData, globalState);
        const result = onNewListItemInitializeExecuter(allData.data ?? {}, allData.contexts ?? {}, allData.globalState, allData.contexts, axiosHttp(backendUrl), moment);
        return Promise.resolve(result);
      }
      : () => {
        return Promise.resolve({});
      };

    return result;
  }, [onNewListItemInitializeExecuter, allData.data, allData.globalState, allData.contexts.lastUpdate]);
  
  const content = useDeepCompareMemo(() => {
    return groups 
      ? groups?.map((item: RowsGroup, index) =>  renderGroup(item, index))
      : records?.map((item: any, index) =>  renderRow(item, index, records?.length - 1 === index));
  }, [groups, records, formConfigs]);

  return (
    <>
      {createModalOpen && createEntityForm?.formConfiguration &&
        <DataListItemCreateModal 
          formInfo={showCreateFormInfo ? persistedCreateFormProps : undefined}
          markup={createEntityForm.formConfiguration.markup} 
          formSettings={createEntityForm.formConfiguration.settings}
          creater={createAction}
          onToggle={(isOpen) => setCreateModalOpen(isOpen)}
          data={onNewListItemInitialize}
          width={props.modalWidth}
        />
      }
      <Show when={showFormInfo}>
        <FormInfo formProps={persistedFormProps} />
      </Show>
      <div>
        <Show when={selectionMode === 'multiple'}>
          <Checkbox
            onChange={(e) => {
              onSelectAllRowsLocal(e.target.checked);
            }}
            checked={selectedRows?.length === records?.length && records?.length > 0}
            indeterminate={selectedRows?.length !== records?.length && selectedRows?.length > 0}
          >
            Select All
          </Checkbox>
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
        <Divider />
      </div>
      <ShaSpin spinning={isFetchingTableData} tip={isFetchingTableData ? 'Loading...' : 'Submitting...'}>
        <div
          key="spin_key"
          ref={measuredRef}
          className={classNames('sha-datalist-component-body', {
            loading: isFetchingTableData && records?.length === 0,
            horizontal: orientation === 'horizontal',
          })}
        >
          <Show when={Boolean(records) /*&& Boolean(formConfiguration?.markup)*/}>
            { content }
          </Show>
        </div>
      </ShaSpin>
    </>
  );
};
