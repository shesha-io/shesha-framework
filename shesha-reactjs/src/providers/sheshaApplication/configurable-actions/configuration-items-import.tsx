import { ConfigurationItemsImport, IImportInterface } from '@/components/configurationFramework/itemsImport';
import React, {
  FC, useState,
} from 'react';
import { Button, App } from 'antd';
import { ICommonModalProps } from '../../dynamicModal/models';
import { ImportOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { useAppConfiguratorState, useDynamicModals } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { ValidationErrors } from '@/components/validationErrors';
import { throwError } from '@/utils/errors';
import { MutableApi } from '@/configuration-studio/cs/utils';

const actionsOwner = 'Configuration Items';

interface IConfigurationItemsImportFooterProps {
  hideModal: () => void;
  importerApi: MutableApi<IImportInterface>;
}

export const ConfigurationItemsImportFooter: FC<IConfigurationItemsImportFooterProps> = (props) => {
  const [inProgress, setInProgress] = useState(false);
  const { hideModal, importerApi } = props;
  const { message, notification } = App.useApp();

  const onImport = (): void => {
    setInProgress(true);

    const importer = importerApi.getApi() ?? throwError("importerRef is not defined");
    importer.importExecuter().then(() => {
      message.info('Items imported successfully');
      hideModal();
    }).catch((error: unknown) => {
      notification.error({
        title: "Failed to import package",
        icon: null,
        description: <ValidationErrors error={error} renderMode="raw" defaultMessage="" />,
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
  const [importerApi] = useState<MutableApi<IImportInterface>>(() => new MutableApi<IImportInterface>());

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
          onClose: (positive = false, result) => {
            if (positive) {
              resolve(result);
            } else {
              reject();
            }
          },
          showModalFooter: false,
          content: <ConfigurationItemsImport onImported={onImported} setImporterApi={importerApi.setApi} />,
          footer: <ConfigurationItemsImportFooter hideModal={hideModal} importerApi={importerApi} />,
        };
        createModal({ ...modalProps });
      });
    },
  }, [appConfigState]);
};
