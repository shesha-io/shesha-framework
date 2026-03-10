import { ConfigurationItemsImport, IImportInterface } from '@/components/configurationFramework/itemsImport';
import React, {
  FC,
  MutableRefObject,
  useRef,
  useState,
} from 'react';
import { Button, App } from 'antd';
import { ICommonModalProps } from '../../dynamicModal/models';
import { ImportOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { useAppConfiguratorState, useDynamicModals } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { ValidationErrors } from '@/components';

const actionsOwner = 'Configuration Items';

interface IConfigurationItemsImportFooterProps {
  hideModal: () => void;
  importerRef: MutableRefObject<IImportInterface | undefined>;
}

export const ConfigurationItemsImportFooter: FC<IConfigurationItemsImportFooterProps> = (props) => {
  const [inProgress, setInProgress] = useState(false);
  const { hideModal, importerRef: exporterRef } = props;
  const { message, notification } = App.useApp();

  const onImport = (): void => {
    setInProgress(true);

    exporterRef.current.importExecuter().then(() => {
      message.info('Items imported successfully');
      hideModal();
    }).catch((error) => {
      notification.error({
        message: "Failed to import package",
        icon: null,
        description: <ValidationErrors error={error} renderMode="raw" defaultMessage={null} />,
      });
      setInProgress(false);
    });
  };

  return (
    <>
      <Button type="default" onClick={hideModal}>Cancel</Button>
      <Button type="primary" icon={<ImportOutlined />} onClick={onImport} loading={inProgress}>Import</Button>
    </>
  );
};

export const useConfigurationItemsImportAction = (): void => {
  const { createModal, removeModal } = useDynamicModals();
  const appConfigState = useAppConfiguratorState();
  const exporterRef = useRef<IImportInterface>();

  useConfigurableAction({
    name: 'Import items',
    owner: actionsOwner,
    ownerUid: SheshaActionOwners.ConfigurationFramework,
    hasArguments: false,
    executer: (actionArgs) => {
      const modalId = nanoid();

      return new Promise((resolve, reject) => {
        const hideModal = (): void => {
          reject();
          removeModal(modalId);
        };

        const onImported = (): void => {
          removeModal(modalId);
          resolve(true);
        };

        const modalProps: ICommonModalProps = {
          ...actionArgs,
          id: modalId,
          title: "Import Configuration",
          width: "60%",
          isVisible: true,
          onClose: (positive, result) => {
            if (positive) {
              resolve(result);
            } else {
              reject();
            }
          },
          showModalFooter: false,
          content: <ConfigurationItemsImport onImported={onImported} importRef={exporterRef} />,
          footer: <ConfigurationItemsImportFooter hideModal={hideModal} importerRef={exporterRef} />,
        };
        createModal({ ...modalProps });
      });
    },
  }, [appConfigState]);
};
