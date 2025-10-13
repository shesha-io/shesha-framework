import ConfigurationItemsExport, { IExportInterface } from '@/components/configurationFramework/itemsExport';
import React, {
  FC,
  MutableRefObject,
  useRef,
  useState,
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
import { isDefined } from '@/utils/nullables';

const actionsOwner = 'Configuration Items';

interface IConfigurationItemsExportFooterProps {
  hideModal: () => void;
  exporterRef: MutableRefObject<IExportInterface | undefined>;
}

export const ConfigurationItemsExportFooter: FC<IConfigurationItemsExportFooterProps> = (props) => {
  const [inProgress, setInProgress] = useState(false);
  const { notification } = App.useApp();
  const { hideModal, exporterRef } = props;

  const onExport = (): void => {
    setInProgress(true);

    if (!isDefined(exporterRef.current))
      throw new Error('exporterRef is not defined');

    exporterRef.current.exportExecuter().then(() => {
      hideModal();
    }).catch((error) => {
      notification.error({
        message: "Failed to export package",
        icon: null,
        description: <ValidationErrors error={error} renderMode="raw" defaultMessage="" />,
      });
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
  const exporterRef = useRef<IExportInterface>();

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
          onClose: (positive, result) => {
            if (positive) {
              resolve(result);
            } else {
              reject();
            }
          },
          content: <ConfigurationItemsExport onExported={onExported} exportRef={exporterRef} />,
          footer: <ConfigurationItemsExportFooter hideModal={hideModal} exporterRef={exporterRef} />,
        };
        createModal({ ...modalProps });
      });
    },
  }, [appConfigState]);
};

