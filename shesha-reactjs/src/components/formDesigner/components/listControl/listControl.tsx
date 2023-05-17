import { isEmpty } from 'lodash';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useGet, useMutate } from 'restful-react';
import { EntitiesGetAllQueryParams, useEntitiesGetAll } from 'apis/entities';
import { FormItemProvider, SubFormProvider, useAppConfigurator, useForm, useGlobalState, useNestedPropertyMetadatAccessor } from 'providers';
import { getQueryParams } from 'utils/url';
import camelCaseKeys from 'camelcase-keys';
import { IListControlProps, IListComponentRenderState, IEvaluatedFilters } from './models';
import { evaluateDynamicFilters } from 'providers/dataTable/utils';
import { useDebouncedCallback } from 'use-debounce';
import { useDelete } from 'hooks';
import {
  Button,
  Checkbox,
  ColProps,
  Divider,
  Form,
  Input,
  message,
  Modal,
  notification,
  Pagination,
  Space,
} from 'antd';
import SubForm from '../subForm/subForm';
import CollapsiblePanel from '../../../panel';
import Show from '../../../show';
import { ButtonGroup } from '../button/buttonGroup/buttonGroupComponent';
import ComponentsContainer from '../../componentsContainer';
import ValidationErrors from '../../../validationErrors';
import ShaSpin from '../../../shaSpin';
import { DeleteFilled } from '@ant-design/icons';
import classNames from 'classnames';
import SectionSeparator from '../../../sectionSeparator';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import ConditionalWrap from '../../../conditionalWrapper';
import moment from 'moment';
import { useFormConfiguration } from '../../../../providers/form/api';
import { useConfigurableAction } from '../../../../providers/configurableActionsDispatcher';
import { useDeepCompareEffect, useMeasure } from 'react-use';
import { DEFAULT_CONFIRM_MESSAGE, DEFAULT_TOTAL_RECORD } from './constants';
import { ConfigurationItemVersionStatusMap } from '../../../../utils/configurationFramework/models';
import FormInfo from '../../../configurableForm/formInfo';
import { useAsyncMemo } from 'hooks/useAsyncMemo';

/** @deprecated: Use DataList instead */
const ListControl: FC<IListControlProps> = props => {
  const {
    containerId,
    dataSource,
    apiSource,
    showPagination,
    paginationDefaultPageSize = 5,
    formId, // Render embedded form if this option is provided
    value,
    name,
    onChange,
    allowDeleteItems,
    deleteUrl,
    deleteConfirmMessage,
    buttons,
    isButtonInline,
    title,
    maxHeight,
    filters,
    properties,
    renderStrategy,
    uniqueStateId,
    submitHttpVerb = 'POST',
    onSubmit,
    submitUrl,
    entityType,
    showQuickSearch,
    labelCol,
    wrapperCol,
    allowRemoteDelete,
    selectionMode,
    namePrefix,
    customVisibility,
    readOnly,
    placeholder,
    orientation,
    listItemWidth,
    customListItemWidth,
    customApiUrl,
  } = props;

  const { formInfoBlockVisible } = useAppConfigurator();

  const { formConfiguration, refetch: refetchFormConfig, error: fetchFormError } = useFormConfiguration({
    formId: formId,
    lazy: !Boolean(formId),
  });

  const formStatusInfo = formConfiguration?.versionStatus
    ? ConfigurationItemVersionStatusMap[formConfiguration.versionStatus]
    : null;

  const showFormInfo = Boolean(formConfiguration) && formInfoBlockVisible && formStatusInfo;

  const [state, setState] = useState<IListComponentRenderState>({
    maxResultCount: paginationDefaultPageSize,
    selectedItemIndexes: [],
  });
  const queryParamsFromBrowser = useMemo(() => getQueryParams(), []);
  const { formData, formMode, setFormControlsData } = useForm();
  const { globalState, setState: setGlobalStateState } = useGlobalState();

  const useGetAll = apiSource === 'custom' ? useGet : useEntitiesGetAll;
  const getAllProps = apiSource === 'custom' ? { path: customApiUrl || '', lazy: true } : { lazy: true };

  const { refetch: fetchAllEntities, loading: isFetchingEntities, data, error: fetchEntitiesError } = useGetAll(
    getAllProps as any
  );

  const fetchEntities = (params: object) => {
    if (apiSource === 'custom') {
      fetchAllEntities();
    } else {
      fetchAllEntities(params);
    }
  };

  const isInDesignerMode = formMode === 'designer';

  const getEvaluatedUrl = (url: string) => {
    if (!url) return '';

    return (() => {
      // tslint:disable-next-line:function-constructor
      return new Function('data, query, globalState', url)(formData, queryParamsFromBrowser, globalState); // Pass data, query, globalState
    })();
  };

  useDeepCompareEffect(() => {
    if (formId) {
      refetchFormConfig();
    }
  }, [formId]);

  const { mutate: deleteHttp, loading: isDeleting, error: deleteError } = useDelete();

  const { mutate: submitHttp, loading: submitting, error: submitError } = useMutate({
    path: getEvaluatedUrl(submitUrl),
    verb: submitHttpVerb,
  });

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);

  const evaluatedFilters = useAsyncMemo<IEvaluatedFilters>(async () => {
    if (!filters)
      return {
        ready: true,
        filter: null,
      };

    const localFormData = !isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    const response = await evaluateDynamicFilters(
      [{ expression: filters } as any],
      [
        {
          match: 'data',
          data: localFormData,
        },
        {
          match: 'globalState',
          data: globalState,
        },
      ],
      propertyMetadataAccessor
    );

    return {
      ready: !response.some(f => f?.unevaluatedExpressions?.length),
      filter: JSON.stringify(response[0]?.expression) || '',
    };
  }, [filters, formData, globalState]);

  const queryParams = useMemo(() => {
    const qp: EntitiesGetAllQueryParams = {
      entityType,
      maxResultCount: showPagination ? state?.maxResultCount : DEFAULT_TOTAL_RECORD,
      skipCount: state?.skipCount,
      quickSearch: state?.quickSearch,
    };

    // _queryParams.properties = Array.from(new Set(['id', properties?.map(p => camelCase(p))])).join(' ');
    qp.properties =
      typeof properties === 'string' ? `id ${properties}` : ['id', ...Array.from(new Set(properties || []))].join(' '); // Always include the `id` property/. Useful for deleting

    if (filters && evaluatedFilters?.filter) {
      qp.filter = evaluatedFilters?.filter;
    }

    return qp;
  }, [properties, showPagination, paginationDefaultPageSize, state, filters, evaluatedFilters, globalState]);

  const debouncedRefresh = useDebouncedCallback(
    () => {
      if (evaluatedFilters?.ready) {
        fetchEntities({ queryParams });
      }
    },
    // delay in ms
    300
  );

  useDeepCompareEffect(() => {
    if (isInDesignerMode) return;

    if (dataSource === 'api') {
      debouncedRefresh();
    }
  }, [isInDesignerMode, dataSource, evaluatedFilters, queryParams]);

  useDeepCompareEffect(() => {
    if (uniqueStateId && Array.isArray(value) && value.length) {
      setFormControlsData({
        name: name,
        values: {
          selectedItemIndexes: state?.selectedItemIndexes,
          selectedItems:
            selectionMode === 'multiple'
              ? value?.filter((_, index) => state?.selectedItemIndexes?.includes(index))
              : null,
          selectedItem: selectionMode === 'single' ? value[state?.selectedItemIndex] : null,
        }
      });
      setGlobalStateState({
        key: uniqueStateId,
        data: {
          selectedItemIndexes: state?.selectedItemIndexes,
          selectedItems:
            selectionMode === 'multiple'
              ? value?.filter((_, index) => state?.selectedItemIndexes?.includes(index))
              : null,
          selectedItem: selectionMode === 'single' ? value[state?.selectedItemIndex] : null,
        },
      });
    }

    /*return () => {
      setGlobalStateState({
        key: uniqueStateId,
        data: undefined,
      });
    };*/
  }, [state, uniqueStateId, value]);

  useDeepCompareEffect(() => {
    setState(prev => ({ ...prev, selectedItemIndexes: [] }));
  }, [value]);

  useDeepCompareEffect(() => {
    if (isInDesignerMode) return;

    if (!isFetchingEntities && typeof onChange === 'function' && data && dataSource === 'api') {
      if (Array.isArray(data?.result?.items)) {
        onChange(data?.result?.items);
      } else if (Array.isArray(data?.result)) {
        onChange(data?.result);
      }
    }
  }, [data, isInDesignerMode, isFetchingEntities]);

  useDeepCompareEffect(() => {
    if (value && !Array.isArray(value) && typeof onChange === 'function' && !isInDesignerMode) {
      onChange([]);
    }
  }, [value, isInDesignerMode]);

  useDeepCompareEffect(() => {
    if (!value) {
      onChange([]); // Make sure the form is not undefined
    }
  }, [value]);

  const actionOwnerName = `List (${name})`;
  useConfigurableAction(
    {
      name: 'Refresh list items',
      owner: actionOwnerName,
      ownerUid: containerId,
      hasArguments: false,
      executer: () => {
        debouncedRefresh(); // todo: return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Save list items',
      owner: actionOwnerName,
      ownerUid: containerId,
      hasArguments: false,
      executer: () => {
        submitListItems(submitUrl); // todo: return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Add list items',
      owner: actionOwnerName,
      ownerUid: containerId,
      hasArguments: false,
      executer: () => {
        debouncedAddItems(state); // todo: return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  const debouncedAddItems = useDebouncedCallback(data => {
    onChange(Array.isArray(value) ? [...value, data] : [data]);
  }, 300);

  const renderPagination = () => {
    if (!showPagination || dataSource !== 'api') return null;

    return (
      <Pagination
        defaultCurrent={1}
        total={data?.result?.totalCount || 50}
        defaultPageSize={paginationDefaultPageSize}
        pageSizeOptions={[5, 10, 15, 20]}
        size="small"
        showSizeChanger
        showTitle
        onChange={(page: number, pageSize) => {
          const skipCount = pageSize * (page - 1);

          setState(prev => ({ ...prev, skipCount, maxResultCount: pageSize }));

          if (evaluatedFilters?.ready) {
            fetchEntities({ queryParams: { ...queryParams, skipCount: skipCount, maxResultCount: pageSize } });
          }
        }}
      />
    );
  };

  const deleteItem = useCallback(
    (index: number, remove: (index: number | number[]) => void) => {
      if (allowRemoteDelete) {
        if (!deleteUrl) {
          notification.error({
            placement: 'top',
            message: "'deleteUrl' missing",
            description: 'Please make sure you have specified the deleteUrl',
          });
        } else {
          const item = value[index];

          console.log('LOGS:: deleteItem item', item);

          const idProp = item?.id || item.Id;

          if (!idProp) {
            notification.error({
              placement: 'top',
              message: "'Id' missing",
              description:
                "In order to delete items on the server, you need to make sure you include the 'Id' in the list of returned properties",
            });
          }

          let confirmMessage =
            deleteConfirmMessage === DEFAULT_CONFIRM_MESSAGE
              ? `return '${DEFAULT_CONFIRM_MESSAGE}'`
              : deleteConfirmMessage;

          if (confirmMessage) {
            // tslint:disable-next-line:function-constructor
            confirmMessage = new Function('data, item, globalState', confirmMessage)(formData, item, globalState);
          }

          const evaluatedDeleteUrl = new Function('data, item, globalState', deleteUrl)(formData, item, globalState);

          const doDelete = () => {
            deleteHttp(evaluatedDeleteUrl).then(() => {
              if (remove) {
                remove(index);
              }
              debouncedRefresh();
            });
          };

          if (confirmMessage) {
            Modal.confirm({
              title: 'Delete this item?',
              content: confirmMessage,
              onOk: doDelete,
            });
          } else {
            doDelete();
          }
        }
      } else if (remove) {
        remove(index);
      }
    },
    [value, deleteUrl, allowRemoteDelete, allowDeleteItems, deleteConfirmMessage]
  );

  const setQuickSearch = useDebouncedCallback((text: string) => {
    setState(prev => ({ ...prev, quickSearch: text }));
  }, 200);

  const submitListItems = useDebouncedCallback(url => {
    if (!url) {
      notification.error({
        message: 'submitUrl missing',
        description: "Please make sure you've specified the submitUrl",
        placement: 'top',
      });
    } else {
      let payload = value;

      if (onSubmit) {
        const getOnSubmitPayload = () => {
          // tslint:disable-next-line:function-constructor
          return new Function('data, query, globalState, items', onSubmit)(
            formData,
            queryParamsFromBrowser,
            globalState,
            value
          ); // Pass data, query, globalState
        };

        payload = Boolean(onSubmit) ? getOnSubmitPayload() : value;
      }

      submitHttp(payload).then(() => {
        message.success('Data saved successfully!');
      });
    }
  }, 500);

  const isSpinning = submitting || isDeleting || isFetchingEntities;

  const hasNoData = value?.length === 0 && !isFetchingEntities;

  const onSelect = useCallback(
    index => {
      if (selectionMode === 'multiple') {
        const selectedItemIndexes = state?.selectedItemIndexes?.includes(index)
          ? state?.selectedItemIndexes?.filter(item => item !== index)
          : [...state?.selectedItemIndexes, index];

        setState(prev => ({ ...prev, selectedItemIndexes, selectedItemIndex: -1 }));
      } else if (selectionMode === 'single') {
        if (state?.selectedItemIndex === index) {
          setState(prev => ({ ...prev, selectedItemIndex: -1, selectedItemIndexes: [] }));
        } else setState(prev => ({ ...prev, selectedItemIndex: index, selectedItemIndexes: [index] }));
      }
    },
    [state, selectionMode]
  );

  const isHidden = useMemo(() => {
    if (!customVisibility) return false;

    const executeExpression = (returnBoolean = true) => {
      if (!customVisibility) {
        if (returnBoolean) {
          return true;
        } else {
          console.error('Expected expression to be defined but it was found to be empty.');

          return false;
        }
      }

      /* tslint:disable:function-constructor */
      const evaluated = new Function('data, formMode, globalState, moment', customVisibility)(
        formData,
        formMode,
        globalState,
        moment
      );

      // tslint:disable-next-line:function-constructor
      return typeof evaluated === 'boolean' ? evaluated : true;
    };

    return executeExpression();
  }, [value]);

  const renderSubForm = (localName?: string | number, localLabelCol?: ColProps, localWrapperCol?: ColProps) => {
    let values: { [key: string]: any } = {
      defaultValue: typeof localName === 'number' && Array.isArray(value) ? value[localName] : null,
    };

    // TODO:: Remove renderStrategy = `dragAndDrop`
    if (renderStrategy === 'externalForm' && Array.isArray(value)) {
      values = { value: value[localName] };
    }
    return (
      <SubFormProvider
        name={`${localName}`}
        markup={{ components: formConfiguration?.markup, formSettings: formConfiguration?.settings }}
        properties={[]}
        labelCol={localLabelCol}
        wrapperCol={localWrapperCol}
        // defaultValue={typeof localName === 'number' && Array.isArray(value) ? value[localName] : null}
        {...values}
      >
        <SubForm readOnly={readOnly} />
      </SubFormProvider>
    );
  };

  const onSelectAll = (e: CheckboxChangeEvent) => {
    setState(prev => ({ ...prev, selectedItemIndexes: e?.target?.checked ? value?.map((_, index) => index) : [] }));
  };

  const [ref, measured] = useMeasure();

  const itemWidth = useMemo(() => {
    if (!measured) return 0;
    //ensures that vertical landscape is always 100% of measured width
    if (!listItemWidth || orientation === 'vertical') {
      return measured?.width;
    }

    if (listItemWidth === 'custom') {
      if (!customListItemWidth) return measured?.width;
      else return customListItemWidth;
    }

    return measured?.width * listItemWidth;
  }, [measured?.width, listItemWidth, customListItemWidth, orientation]);

  if (isHidden && formMode === 'designer') return null;

  return (
    <CollapsiblePanel
      header={title}
      extraClassName="sha-list-component-extra"
      className="sha-list-component-panel"
      extra={
        <div className="sha-list-component-extra-space">
          <Space size="small">
            {renderPagination()}

            <Show when={showQuickSearch}>
              <Input.Search
                onSearch={(t, e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setQuickSearch(t);
                }}
                size="small"
              />
            </Show>

            <ButtonGroup
              items={buttons || []}
              name={''}
              type={''}
              id={containerId}
              size="small"
              isInline={isButtonInline}
            />
          </Space>
        </div>
      }
    >
      <Show when={showFormInfo}>
        <FormInfo {...formConfiguration} />
      </Show>

      <Show when={selectionMode === 'multiple'}>
        <Checkbox
          onChange={onSelectAll}
          checked={state?.selectedItemIndexes?.length === value?.length && value?.length > 0}
          indeterminate={state?.selectedItemIndexes?.length > 0 && state?.selectedItemIndexes?.length !== value?.length}
        >
          Select All
        </Checkbox>
        <SectionSeparator title="" />
      </Show>

      <Show when={isInDesignerMode && renderStrategy === 'dragAndDrop'}>
        <FormItemProvider labelCol={{ span: labelCol }} wrapperCol={{ span: wrapperCol }}>
          <ComponentsContainer containerId={containerId} />
        </FormItemProvider>
      </Show>
      <Show when={isInDesignerMode && renderStrategy === 'externalForm' && Boolean(formId)}>
        {renderSubForm('__IGNORE__', labelCol && { span: labelCol }, wrapperCol && { span: wrapperCol })}
      </Show>

      <Show when={!isInDesignerMode}>
        <ValidationErrors error={fetchFormError} />
        <ValidationErrors error={deleteError} />
        <ValidationErrors error={submitError} />
        <ValidationErrors error={fetchEntitiesError} />

        <ShaSpin spinning={isSpinning} tip={isFetchingEntities ? 'Fetching data...' : 'Submitting'}>
          <Show when={Array.isArray(value)}>
            <div
              ref={ref}
              // ref={containerBodyRef}
              className={classNames('sha-list-component-body', {
                loading: isFetchingEntities && value?.length === 0,
                horizontal: orientation === 'horizontal',
              })}
              style={{ maxHeight: !showPagination ? maxHeight : 'unset' }}
            >
              <Form.List name={namePrefix ? [namePrefix, name]?.join('.')?.split('.') : name} initialValue={[]}>
                {(fields, { remove }) => {
                  return (
                    <ConditionalWrap
                      condition={orientation === 'horizontal'}
                      wrap={c => (
                        <Space size={'middle'} className="sha-list-space-horizontal" direction="horizontal">
                          {c}
                        </Space>
                      )}
                    >
                      {fields?.map((field, index) => {
                        const isLastItem = fields.length - 1 === index;
                        return (
                          <ConditionalWrap
                            key={index}
                            condition={selectionMode !== 'none'}
                            wrap={children => (
                              <Checkbox
                                className={classNames('sha-list-component-item-checkbox', {
                                  selected: state?.selectedItemIndexes?.includes(index),
                                })}
                                checked={state?.selectedItemIndexes?.includes(index)}
                                onChange={() => {
                                  onSelect(index);
                                }}
                              >
                                {children}
                              </Checkbox>
                            )}
                          >
                            <div
                              className={classNames('sha-list-component-item', {
                                selected: state?.selectedItemIndexes?.includes(index),
                              })}
                              onClick={() => {
                                onSelect(index);
                              }}
                              style={{
                                width:
                                  selectionMode === 'none' ? itemWidth : !isNaN(itemWidth) ? itemWidth - 28 : itemWidth,
                              }}
                            >
                              <Show when={Boolean(containerId) && renderStrategy === 'dragAndDrop'}>
                                <FormItemProvider
                                  namePrefix={`${index}`}
                                  wrapperCol={{ span: wrapperCol }}
                                  labelCol={{ span: labelCol }}
                                >
                                  <ComponentsContainer containerId={containerId} noDefaultStyling display="block" />
                                </FormItemProvider>
                              </Show>

                              <Show
                                when={
                                  Boolean(formId) &&
                                  Boolean(formConfiguration?.markup) &&
                                  renderStrategy === 'externalForm'
                                }
                              >
                                {renderSubForm(
                                  index,
                                  labelCol && { span: labelCol },
                                  wrapperCol && { span: wrapperCol }
                                )}
                              </Show>

                              <Show when={allowDeleteItems}>
                                <div className="sha-list-component-add-item-btn">
                                  <Button
                                    danger
                                    type="ghost"
                                    size="small"
                                    className="dynamic-delete-button"
                                    onClick={() => {
                                      deleteItem(field.name, remove);
                                    }}
                                    icon={<DeleteFilled />}
                                  />
                                </div>
                              </Show>

                              {!isLastItem && <Divider className="sha-list-component-divider" />}
                            </div>
                          </ConditionalWrap>
                        );
                      })}
                    </ConditionalWrap>
                  );
                }}
              </Form.List>

              <Show when={hasNoData}>
                <div style={{ textAlign: 'center' }}>{placeholder ?? 'There are no items found.'}</div>
              </Show>
            </div>
          </Show>
        </ShaSpin>
      </Show>
    </CollapsiblePanel>
  );
};

ListControl.displayName = 'ListControl';

export { ListControl };

export default ListControl;
