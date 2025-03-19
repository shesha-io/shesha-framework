import { Modal } from 'antd';
import React, { FC, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import RefListItemGroupConfigurator from './configurator';
import RefListItemsContainer from './refListItemsContainer';
import { useStyles } from './styles/styles';
import { IRefListItemFormModel } from '../provider/models';
import { RefListItemGroupConfiguratorProvider, useRefListItemGroupConfigurator } from '../provider';

interface IFiltersListProps {
  items?: IRefListItemFormModel[];
  showModal?: () => void;
  readOnly?: boolean;
}

export const RefListItemsListInner: FC<Omit<IFiltersListProps, 'items'>> = ({ showModal, readOnly = false }) => {
  const { styles } = useStyles();
  const { items, selectItem } = useRefListItemGroupConfigurator();


  const onConfigClick = (localSelectedId: string) => {
    selectItem(localSelectedId);

    showModal();
  };

  return (
    <div className={styles.shaToolbarConfigurator}>
      <RefListItemsContainer items={items} index={[]} onConfigClick={onConfigClick} readOnly={readOnly} />
    </div>
  );
};

export interface ITableViewSelectorSettingsModal {
  visible: boolean;
  hideModal: () => void;
  value?: object;
  onChange?: any;
  readOnly: boolean;
  referenceList?: any;
}

export const TableViewSelectorSettingsModalInner: FC<ITableViewSelectorSettingsModal> = ({
  visible,
  onChange,
  hideModal,
}) => {
  const { items, readOnly } = useRefListItemGroupConfigurator();
  useDeepCompareEffect(() => {
    onChange(items);
  }, [items]);

  const updateFilters = () => {
    if (typeof onChange === 'function') onChange(items);
    hideModal();
  };

  return (
    <Modal
      width="40%"
      open={visible}
      title={readOnly ? 'View RefList Item' : 'Configure RefList Item'}
      onCancel={hideModal}
      cancelText={readOnly ? 'Close' : undefined}
      okText="Save"
      onOk={updateFilters}
      okButtonProps={{ hidden: readOnly }}
    >
      <RefListItemGroupConfigurator />
    </Modal>
  );
};

export const RefListItemSelectorSettingsModal: FC<Omit<ITableViewSelectorSettingsModal, 'visible' | 'hideModal'>> = (
  props,
) => {
  
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => setModalVisible(true);

  const hideModal = () => setModalVisible(false);

  const items = (props.value as IRefListItemFormModel[]) || [];

  return (
    <RefListItemGroupConfiguratorProvider referenceList={props.referenceList} items={items} readOnly={props.readOnly}>
      <RefListItemsListInner showModal={showModal} readOnly={props.readOnly} />

      <TableViewSelectorSettingsModalInner {...props} visible={modalVisible} hideModal={hideModal} />
    </RefListItemGroupConfiguratorProvider>
  );
};

export default RefListItemSelectorSettingsModal;
