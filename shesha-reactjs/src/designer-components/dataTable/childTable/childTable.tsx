import { Alert, Space } from 'antd';
import camelCaseKeys from 'camelcase-keys';
import { isEmpty } from 'lodash';
import {
  useDataTable,
  useForm,
  useGlobalState,
  useNestedPropertyMetadatAccessor,
  useSheshaApplication,
} from '../../../providers';
import React, { FC, Fragment, MutableRefObject, useEffect } from 'react';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { IChildTableComponentProps } from '.';
import { CollapsiblePanel, GlobalTableFilter, Show, TablePager } from '../../../components';
import { ButtonGroup } from '../../../components/formDesigner/components/button/buttonGroup/buttonGroup';
import ComponentsContainer from '../../../components/formDesigner/containers/componentsContainer';
import { DEFAULT_DT_USER_CONFIG } from '../../../providers/dataTable/contexts';
import { hasDynamicFilter } from '../../../providers/dataTable/utils';
import { evaluateString } from '../../../providers/form/utils';
import { evaluateDynamicFilters, getValidDefaultBool } from '../../../utils';
import './styles/index.less';

export interface IChildTableProps extends IChildTableComponentProps {
  componentRef: MutableRefObject<any>;
}

export const ChildTable: FC<IChildTableProps> = (props) => {
  const { formData, formMode, isComponentHidden } = useForm();
  const { columns, setHiddenFilter, modelType, changePageSize, totalRows } = useDataTable();

  const { globalState } = useGlobalState();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const { defaultSelectedFilterId, filters, permissions, componentRef, defaultPageSize, totalRecords, showPagination } =
    props;

  useEffect(() => {
    if (getValidDefaultBool(showPagination) && defaultPageSize && defaultPageSize !== DEFAULT_DT_USER_CONFIG.pageSize) {
      changePageSize(defaultPageSize);
    }
  }, [defaultPageSize]);

  useEffect(() => {
    if (!getValidDefaultBool(showPagination) && totalRecords) {
      changePageSize(totalRecords);
    }
  }, [totalRecords]);

  componentRef.current = {
    columns,
  };

  //#region Filters
  const hasFilters = filters?.length > 0;

  const foundDynamicFilter = hasDynamicFilter(filters);

  const hasManyFiltersButNoSelected = hasFilters && !defaultSelectedFilterId;

  const hasFormData = !isEmpty(formData);

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  const evaluateDynamicFiltersHelper = () => {
    const data = !isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    evaluateDynamicFilters(
      filters,
      [
        { match: 'data', data: data },
        { match: 'globalState', data: globalState },
      ],
      propertyMetadataAccessor
    ).then((evaluatedFilters) => {
      const filter = defaultSelectedFilterId
        ? evaluatedFilters.find(f => f.id === defaultSelectedFilterId)
        : null;
      setHiddenFilter(props.id, filter);
    });
  };

  useDeepCompareEffect(() => {
    if (hasFilters) {
      evaluateDynamicFiltersHelper();
    }
  }, [props?.filters, formData, globalState, defaultSelectedFilterId]);
  //#endregion

  const showTablePager =
    getValidDefaultBool(showPagination) || (!getValidDefaultBool(showPagination) && totalRows > totalRecords);

  const granted = anyOfPermissionsGranted(permissions || []);

  const isVisible = !isComponentHidden(props) && (granted || formMode === 'designer');

  return (
    <Fragment>
      <Show when={formMode === 'designer'}>
        <Show when={!hasFormData && foundDynamicFilter}>
          <Alert
            style={{ marginBottom: 6 }}
            type="warning"
            message="Found dynamic filters but no state"
            description="Please note that you have dynamic filter(s) but there is no state to evaluate the filter. The table will not be filtered as a result."
          />
        </Show>

        <Show when={hasManyFiltersButNoSelected}>
          <Alert
            style={{ marginBottom: 6 }}
            type="warning"
            message="No selected filter"
            description="Please note you more than one filter and no one is selected. The first one will be used by default"
          />
        </Show>
      </Show>

      <Show when={isVisible}>
        <CollapsiblePanel
          key={undefined}
          header={evaluateString(props?.title, formData)}
          extra={
            <div onClick={(e) => e?.stopPropagation()}>
              <Space size="middle">
                <Show when={props?.allowQuickSearch}>
                  <GlobalTableFilter />
                </Show>

                {showTablePager && <TablePager />}

                <ButtonGroup
                  items={props?.toolbarItems || []}
                  name={''}
                  type={''}
                  id={props.id}
                  isInline={props?.isInline}
                />
              </Space>
            </div>
          }
          noContentPadding
          className="sha-form-designer-child-table"
        >
          <ComponentsContainer
            containerId={props.id}
            dynamicComponents={
              props?.isDynamic ? props?.components?.map((c) => ({ ...c, readOnly: props?.readOnly })) : []
            }
          />
        </CollapsiblePanel>
      </Show>
    </Fragment>
  );
};

export default ChildTable;
