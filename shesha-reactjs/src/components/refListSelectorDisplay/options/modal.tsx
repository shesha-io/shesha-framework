import { Modal } from 'antd';
import { FC, useRef, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import RefListItemGroupConfigurator from './configurator';
import RefListItemsContainer from './refListItemsContainer';
import { useStyles } from './styles/styles';
import { IRefListItemFormModel } from '../provider/models';
import { RefListItemGroupConfiguratorProvider, useRefListItemGroupConfigurator } from '../provider';
import { IReferenceListIdentifier } from '@/interfaces';

interface IFiltersListProps {
  items?: IRefListItemFormModel[];
  showModal: () => void;
  readOnly?: boolean;
}

export const RefListItemsListInner: FC<Omit<IFiltersListProps, 'items'>> = ({ showModal, readOnly = false }) => {
  const { styles } = useStyles();
  const { items, selectItem } = useRefListItemGroupConfigurator();


  const onConfigClick = (localSelectedId: string): void => {
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
  value?: IRefListItemFormModel[] | null | undefined;
  onChange?: ((newValue: IRefListItemFormModel[] | null) => void) | undefined;
  readOnly: boolean;
  referenceList?: IReferenceListIdentifier | undefined;
}

export const TableViewSelectorSettingsModalInner: FC<ITableViewSelectorSettingsModal> = ({
  visible,
  onChange,
  hideModal,
}) => {
  const { items, readOnly } = useRefListItemGroupConfigurator();

  // Only actual changes are written back. Reporting the items the host already holds queued a
  // no-op save on every open of the settings panel and, while the reference list was still being
  // read, briefly wrote an empty list over the configured one.
  const hasReportedInitialItems = useRef(false);
  useDeepCompareEffect(() => {
    if (!hasReportedInitialItems.current) {
      hasReportedInitialItems.current = true;
      return;
    }
    onChange?.(items);
  }, [items]);

  const updateFilters = (): void => {
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

const EMPTY_ITEMS: IRefListItemFormModel[] = [];
export const RefListItemSelectorSettingsModal: FC<Omit<ITableViewSelectorSettingsModal, 'visible' | 'hideModal'>> = (
  props,
) => {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = (): void => setModalVisible(true);

  const hideModal = (): void => setModalVisible(false);

  const items = props.value ?? EMPTY_ITEMS;

  return (
    <RefListItemGroupConfiguratorProvider referenceList={props.referenceList} items={items} readOnly={props.readOnly}>
      <RefListItemsListInner showModal={showModal} readOnly={props.readOnly} />

      <TableViewSelectorSettingsModalInner {...props} visible={modalVisible} hideModal={hideModal} />
    </RefListItemGroupConfiguratorProvider>
  );
};

export default RefListItemSelectorSettingsModal;
