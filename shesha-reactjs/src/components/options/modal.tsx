import { FormMarkup } from '@/index';
import { Button, Modal } from 'antd';
import React, { FC, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { LayerGroupConfiguratorProvider, useLayerGroupConfigurator } from '@/providers/layersProvider';
import { ILayerFormModel } from '@/providers/layersProvider/models';
import LayerGroupConfigurator from './configurator';
import LayerItemsContainer from './layersContainer';
import { useStyles } from './styles/styles';

interface IFiltersListProps {
  layers?: ILayerFormModel[];
  showModal?: () => void;
  readOnly?: boolean;
}

const LayersListInner: FC<Omit<IFiltersListProps, 'layers'>> = ({ showModal, readOnly = false }) => {
  const { styles } = useStyles();
  const { items, addLayer: addButton, selectItem } = useLayerGroupConfigurator();

  const onConfigClick = (localSelectedId: string) => {
    selectItem(localSelectedId);

    showModal();
  };

  return (
    <div className={styles.shaToolbarConfigurator}>
      <LayerItemsContainer items={items} index={[]} onConfigClick={onConfigClick} readOnly={readOnly} />
      {!readOnly && (
        <Button onClick={addButton} size="small" type="primary" block={true}>
          Add Layer
        </Button>
      )}
    </div>
  );
};

export interface ITableViewSelectorSettingsModal {
  visible: boolean;
  hideModal: () => void;
  value?: object;
  onChange?: any;
  readOnly: boolean;
  settings?: FormMarkup;
}

export const TableViewSelectorSettingsModalInner: FC<ITableViewSelectorSettingsModal> = ({
  visible,
  onChange,
  hideModal,
  settings,
}) => {
  const { items, readOnly } = useLayerGroupConfigurator();
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
      title={readOnly ? 'View Layer' : 'Configure Layer'}
      onCancel={hideModal}
      cancelText={readOnly ? 'Close' : undefined}
      okText="Save"
      onOk={updateFilters}
      okButtonProps={{ hidden: readOnly }}
    >
      <LayerGroupConfigurator settings={settings} />
    </Modal>
  );
};

export const LayerSelectorSettingsModal: FC<Omit<ITableViewSelectorSettingsModal, 'visible' | 'hideModal'>> = (
  props,
) => {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => setModalVisible(true);

  const hideModal = () => setModalVisible(false);

  const items = (props.value as ILayerFormModel[]) || [];

  return (
    <LayerGroupConfiguratorProvider items={items} readOnly={props.readOnly}>
      <LayersListInner showModal={showModal} readOnly={props.readOnly} />

      <TableViewSelectorSettingsModalInner {...props} visible={modalVisible} hideModal={hideModal} />
    </LayerGroupConfiguratorProvider>
  );
};

export default LayerSelectorSettingsModal;
