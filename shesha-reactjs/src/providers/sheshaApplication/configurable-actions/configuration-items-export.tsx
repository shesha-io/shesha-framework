import ConfigurationItemsExport, { IExportInterface } from '@/components/configurationFramework/itemsExport';
import React, {
  FC,
  MutableRefObject,
  useRef,
  useState
} from 'react';
import { Button, notification } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { ICommonModalProps } from '../../dynamicModal/models';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { nanoid } from '@/utils/uuid';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { useAppConfiguratorState, useDynamicModals } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { ValidationErrors } from '@/components';
import _ from 'lodash';

const actionsOwner = 'Configuration Framework';

interface IConfigurationItemsExportFooterProps {
  hideModal: () => void;
  exporterRef: MutableRefObject<IExportInterface>;
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
  const { hideModal, exporterRef } = props;

  const onExport = () => {
    setInProgress(true);

    exporterRef.current.exportExecuter().then(() => {
      hideModal();
    }).catch((e) => {
      displayNotificationError('Failed to export package', e);
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

      return new Promise((resolve, _reject) => {

        const hideModal = () => {
          _reject();
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
          onClose: (positive, result) => {
            if (positive) {
              resolve(result);
            } else {
              _reject();
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

