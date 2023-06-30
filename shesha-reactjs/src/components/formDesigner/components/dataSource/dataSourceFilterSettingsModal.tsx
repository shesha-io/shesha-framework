import React, { FC, useRef, useState } from 'react';
import { Button, Modal } from 'antd';
import {
  TableViewSelectorConfiguratorProvider,
  useTableViewSelectorConfigurator,
} from '../../../../providers/tableViewSelectorConfigurator';
import { ITableViewSelectorConfiguratorHandles, TableViewSelectorConfigurator } from '../../../../designer-components/dataTable/tableViewSelector/tableViewSelectorConfigurator';
import { ITableViewProps } from '../../../../providers/tableViewSelectorConfigurator/models';
import { useDeepCompareEffect } from 'react-use';
import { SettingOutlined } from '@ant-design/icons';

/*interface IFiltersListProps {
  filters?: ITableViewProps[];
  showModal?: () => void;
  readOnly?: boolean;
}

const FiltersListInner: FC<Omit<IFiltersListProps, 'filters'>> = ({ showModal, readOnly = false }) => {
  const { items, addItem: addButton, selectItem } = useTableViewSelectorConfigurator();

  const onConfigClick = (localSelectedId: string) => {
    selectItem(localSelectedId);

    showModal();
  };

  return (
    <div>
      {!readOnly && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={addButton} size="small" type="primary">
              Add Filter Item
            </Button>
          </div>

          <Divider />
        </>
      )}

      <TableViewContainer items={items} index={[]} onConfigClick={onConfigClick} readOnly={readOnly}/>
    </div>
  );
};*/

export interface IDataSourceFilterSettingsModal {
  visible: boolean;
  hideModal: () => void;
  value?: object;
  onChange?: any;
  readOnly: boolean;
}

export const DataSourceFilterSettingsModalInner: FC<IDataSourceFilterSettingsModal> = ({
  visible,
  onChange,
  hideModal,
}) => {
  const { items, readOnly } = useTableViewSelectorConfigurator();
  const configRef = useRef<ITableViewSelectorConfiguratorHandles>();

  useDeepCompareEffect(() => {
    // TODO: Check why the items are not updating properly when the model closes
    // if (!visible) {
    //   // We only want to execute this code when the dialog is not visible
    //   onChange(items);
    // }

    onChange(items);
  }, [items]);

  const updateFilters = () => {
    if (typeof onChange === 'function') {
      // This code will cause `items` to change, in which case `onChange` will get triggered
      // As a result, we do not want want to call `onChange` again here
      configRef?.current?.saveFilters();
    }
    hideModal();
  };

  return (
    <Modal
      width="75%"
      open={visible}
      title={readOnly ?  'View Filter' : 'Configure Filter'}
      onCancel={hideModal}
      cancelText={readOnly ? 'Close' : undefined}

      okText="Save"
      onOk={updateFilters}
      okButtonProps={{ hidden: readOnly }}
    >
      <TableViewSelectorConfigurator ref={configRef} />
    </Modal>
  );
};

export const DataSourceFilterSettingsModal: FC<Omit<
IDataSourceFilterSettingsModal,
  'visible' | 'hideModal'
>> = props => {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => setModalVisible(true);

  const hideModal = () => setModalVisible(false);

  const items = props.value ? [props.value] as ITableViewProps[] : [];

  return (
    <TableViewSelectorConfiguratorProvider items={items} readOnly={props.readOnly}>
      <Button icon={<SettingOutlined />} onClick={showModal}>{props.readOnly ? 'View filter' : 'Configure filter'}</Button>
      <DataSourceFilterSettingsModalInner {...props} visible={modalVisible} hideModal={hideModal} />
    </TableViewSelectorConfiguratorProvider>
  );
};

export default DataSourceFilterSettingsModal;
