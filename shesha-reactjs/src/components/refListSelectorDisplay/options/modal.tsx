import { Modal } from 'antd';
import { FC, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import RefListItemGroupConfigurator from './configurator';
import RefListItemsContainer from './refListItemsContainer';
import { useStyles } from './styles/styles';
import { IRefListItemFormModel } from '../provider/models';
import { RefListItemGroupConfiguratorProvider, useRefListItemGroupConfigurator } from '../provider';
import { IReferenceListIdentifier } from '@/interfaces';
import { removeUndefinedProps } from '@/utils/object';
import { isEqual } from 'lodash';

const EMPTY_ITEMS: IRefListItemFormModel[] = [];

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

/**
 * Compares two item lists the way the host stores them: a property that is absent, undefined,
 * null or blank means the same thing once saved, so reading the reference list must not read as a
 * change simply because it filled those in.
 */
const isSameConfiguration = (left: IRefListItemFormModel[], right: IRefListItemFormModel[] | null | undefined): boolean =>
  isEqual(removeUndefinedProps(left), removeUndefinedProps(right ?? EMPTY_ITEMS));

export const TableViewSelectorSettingsModalInner: FC<ITableViewSelectorSettingsModal> = ({
  visible,
  value,
  onChange,
  hideModal,
}) => {
  const { items, readOnly } = useRefListItemGroupConfigurator();

  // Report the items only when they differ from what the host already holds. Reading the reference
  // list normalises them, and reporting that normalisation marked the form as modified as soon as
  // the component was selected - before the user had changed anything.
  useDeepCompareEffect(() => {
    if (isSameConfiguration(items, value)) return;
    onChange?.(items);
  }, [items, value]);

  const updateFilters = (): void => {
    if (typeof onChange === 'function' && !isSameConfiguration(items, value)) onChange(items);
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
