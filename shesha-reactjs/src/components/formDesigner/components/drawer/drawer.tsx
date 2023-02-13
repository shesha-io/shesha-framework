import { Alert, Button, Drawer, DrawerProps, message, Space } from 'antd';
import moment from 'moment';
import React, { FC, Fragment, useState } from 'react';
import { axiosHttp } from '../../../../apis/axios';
import { IConfigurableActionConfiguration } from '../../../../interfaces/configurableAction';
import { useForm, useGlobalState, useSheshaApplication } from '../../../../providers';
import {
  useConfigurableAction,
  useConfigurableActionDispatcher,
} from '../../../../providers/configurableActionsDispatcher';
import { executeScriptSync } from '../../../../providers/form/utils';
import ComponentsContainer from '../../componentsContainer';
import { IDrawerProps } from './models';

export interface IShaDrawerProps extends Omit<IDrawerProps, 'style' | 'size'>, DrawerProps {}

interface IShaDrawerState {
  open?: boolean;
}

const ShaDrawer: FC<IShaDrawerProps> = props => {
  const {
    id,
    placement,
    width,
    name,
    readOnly,
    label,
    onOkAction,
    onCancelAction,
    okText,
    cancelText,
    components,
    isDynamic,
    okButtonCustomEnabled,
    cancelButtonCustomEnabled,
  } = props;
  const { backendUrl } = useSheshaApplication();
  const [state, setState] = useState<IShaDrawerState>();
  const { formMode, formData } = useForm();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { executeAction } = useConfigurableActionDispatcher();

  const openDrawer = () => setState(prev => ({ ...prev, open: true }));

  const closeDrawer = () => setState(prev => ({ ...prev, open: false }));

  const actionOwnerName = `Drawer (${name})`;

  const actionEvaluationContext = {
    data: formData,
    formMode: formMode,
    globalState,
    http: axiosHttp(backendUrl),
    message,
    setGlobalState,
    moment: moment,
  };

  const onOkHandler = () => {
    executeActionIfConfigured(onOkAction);
  };

  const onCancelHandler = () => {
    executeActionIfConfigured(onCancelAction);
  };

  /// NAVIGATION
  const executeActionIfConfigured = (actionConfiguration: IConfigurableActionConfiguration) => {
    if (!actionConfiguration) {
      console.warn(`Action not configured '${actionConfiguration.toString()}'`);
      return;
    }

    executeAction({
      actionConfiguration: actionConfiguration,
      argumentsEvaluationContext: actionEvaluationContext,
    });
  };

  useConfigurableAction(
    {
      name: 'Open drawer',
      owner: actionOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        openDrawer(); // todo: return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Close drawer',
      owner: actionOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        closeDrawer(); // todo: return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  const context = {
    data: formData,
    globalState,
  };

  const okButtonDisabled = !executeScriptSync<boolean>(okButtonCustomEnabled, context);
  const cancelButtonDisabled = !executeScriptSync<boolean>(cancelButtonCustomEnabled, context);

  if (formMode === 'designer') {
    return (
      <Fragment>
        <Alert
          type="warning"
          message="This component only shows in designer mode. Otherwise it will show only in the drawer"
          showIcon
        />
        <ComponentsContainer containerId={id} />
      </Fragment>
    );
  }

  return (
    <Drawer
      open={state?.open}
      placement={placement}
      width={width}
      onClose={closeDrawer}
      title={label}
      size="large"
      footer={
        <Space>
          <Button onClick={onCancelHandler} disabled={cancelButtonDisabled}>
            {cancelText || 'Cancel'}
          </Button>

          <Button type="primary" onClick={onOkHandler} disabled={okButtonDisabled}>
            {okText || 'Ok'}
          </Button>
        </Space>
      }
    >
      <ComponentsContainer
        containerId={id}
        dynamicComponents={isDynamic ? components?.map(c => ({ ...c, readOnly: readOnly })) : []}
      />
    </Drawer>
  );
};

ShaDrawer.displayName = 'ShaDrawer';

export { ShaDrawer };

export default ShaDrawer;
