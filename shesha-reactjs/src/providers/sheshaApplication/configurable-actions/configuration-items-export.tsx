import ConfigurationItemsExport, { IExportInterface } from '@/components/configurationFramework/itemsExport';
import React, {
  FC, useState,
} from 'react';
import { Button, App } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { ICommonModalProps } from '../../dynamicModal/models';
import { nanoid } from '@/utils/uuid';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { useAppConfiguratorState, useDynamicModals } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { ValidationErrors } from '@/components/validationErrors';
import { isDefined } from '@/utils/nullables';
import { MutableApi } from '@/configuration-studio/cs/utils';

const actionsOwner = 'Configuration Items';

interface IConfigurationItemsExportFooterProps {
  hideModal: () => void;
  exporterApi: MutableApi<IExportInterface>;
}

export const ConfigurationItemsExportFooter: FC<IConfigurationItemsExportFooterProps> = (props) => {
  const [inProgress, setInProgress] = useState(false);
  const { notification } = App.useApp();
  const { hideModal, exporterApi } = props;

  const onExport = (): void => {
    const exporter = exporterApi.getApi();
    if (!isDefined(exporter))
      throw new Error('exporterRef is not defined');

    if (!exporter.canExport())
      return;

    setInProgress(true);
    exporter.exportExecuter().then(() => {
      hideModal();
    }).catch((error: unknown) => {
      notification.error({
        title: "Failed to export package",
        icon: null,
        description: <ValidationErrors error={error} renderMode="raw" defaultMessage="" />,
      });
    })
      .finally(() => {
        setInProgress(false);
      });
  };

  return (
    <>
      <Button type="default" onClick={hideModal}>Cancel</Button>
      <Button type="primary" icon={<ExportOutlined />} onClick={onExport} loading={inProgress}>Export</Button>
    </>
  );
};

export const useConfigurationItemsExportAction = (): void => {
  const { createModal, removeModal } = useDynamicModals();
  const appConfigState = useAppConfiguratorState();
  const [exporterApi] = useState<MutableApi<IExportInterface>>(() => new MutableApi<IExportInterface>());

  useConfigurableAction({
    name: 'Export items',
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

        const onExported = (): void => {
          removeModal(modalId);
          resolve(true);
        };

        const modalProps: ICommonModalProps = {
          ...actionArgs,
          id: modalId,
          title: "Export Configuration",
          isVisible: true,
          showModalFooter: false,
          width: "60%",
          onClose: (positive = false, result) => {
            if (positive) {
              resolve(result);
            } else {
              reject();
            }
          },
          content: <ConfigurationItemsExport onExported={onExported} setExporterApi={(exporter) => (exporterApi.setApi(exporter))} />,
          footer: <ConfigurationItemsExportFooter hideModal={hideModal} exporterApi={exporterApi} />,
        };
        createModal({ ...modalProps });
      });
    },
  }, [appConfigState]);
};

