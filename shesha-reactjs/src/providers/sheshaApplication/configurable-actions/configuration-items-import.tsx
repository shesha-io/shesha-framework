import { ImportOutlined } from "@ant-design/icons";
import { Button, message, notification } from "antd";
import { nanoid } from "nanoid";
import React, { FC, MutableRefObject, useRef, useState } from "react";
import { useAppConfiguratorState, useDynamicModals, ValidationErrors } from "../../..";
import ConfigurationItemsImport, { IImportInterface } from "../../../components/configurationFramework/itemsImport";
import { IErrorInfo } from "../../../interfaces/errorInfo";
import { useConfigurableAction } from "../../configurableActionsDispatcher";
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";
import { ICommonModalProps } from "../../dynamicModal/models";

const actionsOwner = 'Configuration Framework';

export const useConfigurationItemsImportAction = () => {
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

      return new Promise((resolve, _reject) => {

        const hideModal = () => {
          removeModal(modalId);
        }

        const onImported = () => {
          console.log('onImported');
          removeModal(modalId);
          resolve(true);
        }

        const modalProps: ICommonModalProps = {
          ...actionArgs,
          id: modalId,
          title: "Import Configuration Items",
          isVisible: true,
          showModalFooter: false,
          content: <ConfigurationItemsImport onImported={onImported} importRef={exporterRef} />,
          footer: <ConfigurationItemsExportFooter hideModal={hideModal} importerRef={exporterRef} />
        };
        createModal({ ...modalProps, isVisible: true });
      });
    },
  }, [appConfigState]);
};


interface IConfigurationItemsExportFooterProps {
  hideModal: () => void;
  importerRef: MutableRefObject<IImportInterface>;
}

const displayNotificationError = (message: string, error: IErrorInfo) => {
  notification.error({
      message: message,
      icon: null,
      description: <ValidationErrors error={error} renderMode="raw" defaultMessage={null} />,
  });
};

export const ConfigurationItemsExportFooter: FC<IConfigurationItemsExportFooterProps> = (props) => {
  const [inProgress, setInProgress] = useState(false);
  const { hideModal, importerRef: exporterRef } = props;

  const onImport = () => {
    setInProgress(true);

    exporterRef.current.importExecuter().then(() => {
      message.info('Items imported successfully');
      hideModal();
    }).catch((e) => {
      console.log('catch in footer');
      displayNotificationError('Failed to import package', e);
      setInProgress(false);
    });
  }

  return (
    <>
      <Button type='default' onClick={hideModal}>Cancel</Button>
      <Button type='primary' icon={<ImportOutlined />} onClick={onImport} loading={inProgress}>Import</Button>
    </>
  );
}