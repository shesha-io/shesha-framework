import React, { FC, Fragment, useState } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FilterOutlined } from '@ant-design/icons';
import { FilterTarget, ICustomFilterProps } from './models';
import { ConfigurableFormItem } from '../../../..';
import { Button, Modal } from 'antd';
import { QueryBuilderWrapper } from '../../queryBuilder/queryBuilderWrapper';
import { TableViewSelectorConfiguratorProvider, useTableViewSelectorConfigurator } from '../../../../../providers';
import FilterConfigurator from './filterConfigurator';
import { ITableViewProps } from '../../../../../providers/tableViewSelectorConfigurator/models';
import { useMedia } from 'react-use';

const CustomFilterComponent: IToolboxComponent<ICustomFilterProps> = {
  type: 'filter',
  name: 'Filter',
  icon: <FilterOutlined />,
  isHidden: true,
  factory: (model: ICustomFilterProps) => {
    return (
      <ConfigurableFormItem model={model}>
        <CustomFilter target={model?.target} />
      </ConfigurableFormItem>
    );
  },
  initModel: (model: ICustomFilterProps) => {
    return {
      ...model,
      filters: [],
    };
  },
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

  const toggleFiltersModal = () => setShowModal(prev => !prev);

  return (
    <Fragment>
      <Button onClick={toggleFiltersModal}>{ readOnly ? 'View Filters' : 'Customise Filters' }</Button>

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
      cancelText={ readOnly ? 'Close' : undefined }

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
