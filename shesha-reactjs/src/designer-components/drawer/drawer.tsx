import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import ParentProvider from '@/providers/parentProvider/index';
import React, { CSSProperties, FC, Fragment, ReactNode, useState } from 'react';
import { Alert, Button, Drawer, Space } from 'antd';
import { executeScriptSync, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { useConfigurableAction, useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { IConfigurableFormComponent } from '@/providers';
interface IShaDrawer {
  id?: string;
  componentName?: string;
  showFooter?: boolean;
  label?: string | ReactNode;
  onOkAction?: IConfigurableActionConfiguration;
  onCancelAction?: IConfigurableActionConfiguration;
  okText?: string;
  cancelText?: string;
  components?: IConfigurableFormComponent[];
  style?: CSSProperties;
  isDynamic?: boolean;
  okButtonCustomEnabled?: string;
  cancelButtonCustomEnabled?: string;
  showHeader?: boolean;
  headerStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  width?: string | number;
  readOnly?: boolean;
  backgroundStyles?: CSSProperties;
  dimensions?: {
    width?: string | number;
    height?: string | number;
  };
  stylingBoxAsCSS?: CSSProperties;
}

interface IShaDrawerState {
  open?: boolean;
}

const ShaDrawer: FC<IShaDrawer> = (props) => {
  const {
    id,
    placement,
    dimensions,
    componentName: name,
    readOnly,
    label,
    onOkAction,
    onCancelAction,
    okText,
    cancelText,
    components,
    style,
    isDynamic,
    okButtonCustomEnabled,
    cancelButtonCustomEnabled,
    showHeader,
    headerStyle,
    footerStyle,
    showFooter,
    backgroundStyles,
    stylingBoxAsCSS,
  } = props;
  const allData = useAvailableConstantsData();
  const [state, setState] = useState<IShaDrawerState>();
  const { executeAction } = useConfigurableActionDispatcher();
  const { paddingTop, paddingRight, paddingBottom, paddingLeft, ...rest } = stylingBoxAsCSS;

  const openDrawer = () => setState((prev) => ({ ...prev, open: true }));

  const closeDrawer = () => setState((prev) => ({ ...prev, open: false }));

  const actionOwnerName = `Drawer (${name})`;

  /// NAVIGATION
  const executeActionIfConfigured = (actionConfiguration: IConfigurableActionConfiguration) => {
    if (!actionConfiguration) {
      console.warn(`Action not configured '${actionConfiguration.toString()}'`);
      return;
    }

    executeAction({
      actionConfiguration: actionConfiguration,
      argumentsEvaluationContext: allData,
    });
  };

  const onOkHandler = () => {
    executeActionIfConfigured(onOkAction);
  };

  const onCancelHandler = () => {
    executeActionIfConfigured(onCancelAction);
  };

  useConfigurableAction(
    {
      name: 'Open drawer',
      owner: actionOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        openDrawer(); // TODO: return real promise
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
        closeDrawer(); // TODO: return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  const context = {
    data: allData.data,
    globalState: allData.globalState,
  };

  const okButtonDisabled = !!okButtonCustomEnabled
    ? !executeScriptSync<boolean>(okButtonCustomEnabled, context)
    : false;
  const cancelButtonDisabled = !!cancelButtonCustomEnabled
    ? !executeScriptSync<boolean>(cancelButtonCustomEnabled, context)
    : false;

  if (allData.form?.formMode === 'designer') {
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
      width={dimensions?.width}
      height={dimensions?.height}
      onClose={closeDrawer}
      styles={{
        header: { display: showHeader ? 'block' : 'none', ...headerStyle },
        footer: { display: showFooter ? 'block' : 'none', ...footerStyle },
        body: backgroundStyles as CSSProperties,
        content: {
          ...style,
          height: undefined,
          width: undefined,
          paddingTop,
          paddingRight,
          paddingBottom,
          paddingLeft,
        },
        wrapper: {
          width: style?.width || props.dimensions?.width,
          height: style?.height || props.dimensions?.height,
          ...rest,
        },
      }}
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
      <ParentProvider model={props}>
        <ComponentsContainer
          containerId={id}
          dynamicComponents={isDynamic ? components?.map((c) => ({ ...c, readOnly: readOnly })) : []}
        />
      </ParentProvider>
    </Drawer>
  );
};

ShaDrawer.displayName = 'ShaDrawer';

export { ShaDrawer };

export default ShaDrawer;
