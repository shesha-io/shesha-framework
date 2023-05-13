import React, { FC, useState } from 'react';
import { Button, Divider, Modal } from 'antd';
import { useDeepCompareEffect } from 'react-use';
import { LayerGroupConfiguratorProvider, useLayerGroupConfigurator } from 'providers/layersConfigurator';
import LayerItemsContainer from './layersContainer';
import { ILayerFormModel } from 'providers/layersConfigurator/models';
import LayerGroupConfigurator from './configurator';

interface IFiltersListProps {
  layers?: ILayerFormModel[];
  showModal?: () => void;
  readOnly?: boolean;
}

const LayersListInner: FC<Omit<IFiltersListProps, 'layers'>> = ({ showModal, readOnly = false }) => {
  const { items, addLayer: addButton, selectItem } = useLayerGroupConfigurator();

  const onConfigClick = (localSelectedId: string) => {
    selectItem(localSelectedId);

    showModal();
  };

  return (
    <div>
      <LayerItemsContainer items={items} index={[]} onConfigClick={onConfigClick} readOnly={readOnly} />
      {!readOnly && (
        <>
          <Divider />
          <Button onClick={addButton} size="large" type="default" block={true}>
            Add Layer
          </Button>
        </>
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
}

export const TableViewSelectorSettingsModalInner: FC<ITableViewSelectorSettingsModal> = ({
  visible,
  onChange,
  hideModal,
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
      <LayerGroupConfigurator />
    </Modal>
  );
};

export const TestSelectorSettingsModal: FC<Omit<ITableViewSelectorSettingsModal, 'visible' | 'hideModal'>> = (
  props
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

export default TestSelectorSettingsModal;
