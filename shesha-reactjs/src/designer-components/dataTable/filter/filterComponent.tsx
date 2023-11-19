import { FilterOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { useMedia } from 'react-use';
import { ConfigurableFormItem } from 'components';
import { QueryBuilderWrapper } from 'designer-components/queryBuilder/queryBuilderWrapper';
import { IToolboxComponent } from 'interfaces';
import { TableViewSelectorConfiguratorProvider, useTableViewSelectorConfigurator } from 'providers';
import { ITableViewProps } from 'providers/tableViewSelectorConfigurator/models';
import FilterConfigurator from './filterConfigurator';
import { FilterTarget, ICustomFilterComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from 'designer-components/_common-migrations/migrateVisibility';

const CustomFilterComponent: IToolboxComponent<ICustomFilterComponentProps> = {
  type: 'filter',
  name: 'Filter',
  icon: <FilterOutlined />,
  isHidden: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        <CustomFilter target={model?.target} />
      </ConfigurableFormItem>
    );
  },
  initModel: (model: ICustomFilterComponentProps) => {
    return {
      ...model,
      filters: [],
    };
  },
  migrator:  m => m
    .add<ICustomFilterComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev) as ICustomFilterComponentProps))
    .add<ICustomFilterComponentProps>(1, (prev) => migrateVisibility(prev))
  ,
};

//#region CustomFilter
interface ICustomFilter {
  value?: any;
  onChange?: any;
  target?: FilterTarget;
  readOnly?: boolean;
}

export const CustomFilter: FC<ICustomFilter> = ({ value, onChange, readOnly = false }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleFiltersModal = () => setShowModal((prev) => !prev);

  return (
    <Fragment>
      <Button onClick={toggleFiltersModal}>{readOnly ? 'View Filters' : 'Customise Filters'}</Button>

      <QueryBuilderWrapper>
        <TableViewSelectorConfiguratorProvider items={(value as ITableViewProps[]) || []} readOnly={readOnly}>
          <FilterSettingsModalInner visible={showModal} onChange={onChange} hideModal={toggleFiltersModal} />
        </TableViewSelectorConfiguratorProvider>
      </QueryBuilderWrapper>
    </Fragment>
  );
};
//#endregion

//#region FilterSettingsModalInner
export interface IFilterSettingsModal {
  visible: boolean;
  hideModal: () => void;
  value?: object;
  onChange?: any;
  target?: FilterTarget;
}

export const FilterSettingsModalInner: FC<IFilterSettingsModal> = ({ visible, onChange, hideModal }) => {
  const { items, readOnly } = useTableViewSelectorConfigurator();
  const isSmall = useMedia('(max-width: 480px)');

  const onOkClick = () => {
    if (typeof onChange === 'function') onChange(items);
    hideModal();
  };

  return (
    <Modal
      width={isSmall ? '90%' : '60%'}
      open={visible}
      title={readOnly ? 'View Filters' : 'Configure Filters'}
      onCancel={hideModal}
      cancelText={readOnly ? 'Close' : undefined}
      okText="Save"
      onOk={onOkClick}
      okButtonProps={{ hidden: readOnly }}
    >
      <FilterConfigurator />
    </Modal>
  );
};
//#endregion

export default CustomFilterComponent;
