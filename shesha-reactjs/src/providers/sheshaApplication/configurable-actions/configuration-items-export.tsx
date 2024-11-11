import ConfigurationItemsExport, { IExportInterface } from '@/components/configurationFramework/itemsExport';
import React, {
  FC,
  MutableRefObject,
  useRef,
  useState
} from 'react';
import { Button, App } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { ICommonModalProps } from '../../dynamicModal/models';
import { nanoid } from '@/utils/uuid';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { useAppConfiguratorState, useDynamicModals } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { ValidationErrors } from '@/components';
import _ from 'lodash';

const actionsOwner = 'Configuration Items';

interface IConfigurationItemsExportFooterProps {
  hideModal: () => void;
  exporterRef: MutableRefObject<IExportInterface>;
}

export const ConfigurationItemsExportFooter: FC<IConfigurationItemsExportFooterProps> = (props) => {
  const [inProgress, setInProgress] = useState(false);
  const { notification } = App.useApp();
  const { hideModal, exporterRef } = props;

  const onExport = () => {
    setInProgress(true);

    exporterRef.current.exportExecuter().then(() => {
      hideModal();
    }).catch((error) => {
      notification.error({
        message: "Failed to export package",
        icon: null,
        description: <ValidationErrors error={error} renderMode="raw" defaultMessage={null} />,
      });
      setInProgress(false);
    });
  };

  return (
    <>
      <Button type='default' onClick={hideModal}>Cancel</Button>
      <Button type='primary' icon={<ExportOutlined />} onClick={onExport} loading={inProgress}>Export</Button>
    </>
  );
};

export const useConfigurationItemsExportAction = () => {
  const { createModal, removeModal } = useDynamicModals();
  const appConfigState = useAppConfiguratorState();
  const exporterRef = useRef<IExportInterface>();

  useConfigurableAction({
    name: 'Export items',
    owner: actionsOwner,
    ownerUid: SheshaActionOwners.ConfigurationFramework,
    hasArguments: false,
    executer: (actionArgs) => {
      const modalId = nanoid();

      return new Promise((resolve, reject) => {

        const hideModal = () => {
          reject();
          removeModal(modalId);
        };

        const onExported = () => {
          removeModal(modalId);
          resolve(true);
        };

        const modalProps: ICommonModalProps = {
          ...actionArgs,
          id: modalId,
          title: "Export Configuration Items",
          isVisible: true,
          showModalFooter: false,
          width: "60%",
          onClose: (positive, result) => {
            if (positive) {
              resolve(result);
            } else {
              reject();
            }
          },
          content: <ConfigurationItemsExport onExported={onExported} exportRef={exporterRef} />,
          footer: <ConfigurationItemsExportFooter hideModal={hideModal} exporterRef={exporterRef} />
        };
        createModal({ ...modalProps });
      });
    },
  }, [appConfigState]);
};

