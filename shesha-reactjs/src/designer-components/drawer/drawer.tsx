import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import ParentProvider from '@/providers/parentProvider/index';
import React, { CSSProperties, FC, Fragment, ReactNode, useState } from 'react';
import { Alert, Button, Drawer, Space } from 'antd';
import { executeScriptSync, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { useConfigurableAction, useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { IConfigurableFormComponent, IFormComponentStyles } from '@/providers';
import { IDimensionsValue } from '../_settings/utils/dimensions/interfaces';
interface IShaDrawer {
  id?: string | undefined;
  componentName?: string | undefined;
  showFooter?: boolean | undefined;
  label?: string | ReactNode;
  onOkAction?: IConfigurableActionConfiguration | undefined;
  onCancelAction?: IConfigurableActionConfiguration | undefined;
  okText?: string | undefined;
  cancelText?: string | undefined;
  components?: IConfigurableFormComponent[] | undefined;
  style?: CSSProperties | undefined;
  isDynamic?: boolean | undefined;
  okButtonCustomEnabled?: string | undefined;
  cancelButtonCustomEnabled?: string | undefined;
  showHeader?: boolean | undefined;
  headerStyle?: CSSProperties | undefined;
  footerStyle?: CSSProperties | undefined;
  placement?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  width?: string | number | undefined;
  readOnly?: boolean | undefined;
  backgroundStyles?: CSSProperties | undefined;
  dimensions?: IDimensionsValue | undefined;
  stylingBoxAsCSS?: CSSProperties | undefined;
  allStyles?: IFormComponentStyles | undefined;
}

interface IShaDrawerState {
  open: boolean;
}

const ShaDrawer: FC<IShaDrawer> = (props) => {
  const {
    id = "",
    placement,
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
  } = props;
  const allData = useAvailableConstantsData();
  const [state, setState] = useState<IShaDrawerState>({ open: false });
  const { executeAction } = useConfigurableActionDispatcher();
  const {
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    marginRight,
    marginLeft,
    marginBottom,
    marginTop,
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
    backgroundColor,
    minHeight,
    minWidth,
    maxHeight,
    maxWidth,
    width,
    height,
    ...rest
  } = style ?? {};

  const openDrawer = (): void => setState((prev) => ({ ...prev, open: true }));

  const closeDrawer = (): void => setState((prev) => ({ ...prev, open: false }));

  const actionOwnerName = `Drawer (${name})`;

  /// NAVIGATION
  const executeActionIfConfigured = (actionConfiguration: IConfigurableActionConfiguration | undefined): void => {
    if (!actionConfiguration) {
      console.warn(`Action not configured`);
      return;
    }

    void executeAction({
      actionConfiguration: actionConfiguration,
      argumentsEvaluationContext: allData,
    });
  };

  const onOkHandler = (): void => {
    executeActionIfConfigured(onOkAction);
  };

  const onCancelHandler = (): void => {
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
    [state],
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
    [state],
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
          title="This component only shows in designer mode. Otherwise it will show only in the drawer"
          showIcon
        />
        <ComponentsContainer containerId={id} />
      </Fragment>
    );
  }

  const size = placement === 'top' || placement === 'bottom'
    ? height
    : placement === 'left' || placement === 'right'
      ? width
      : undefined;

  return (
    <Drawer
      open={state.open}
      {...(placement ? { placement } : {})}
      size={size ?? "large"}
      onClose={closeDrawer}
      styles={{
        header: { display: showHeader ? 'block' : 'none', ...headerStyle },
        footer: { display: showFooter ? 'block' : 'none', ...footerStyle },
        body: {
          backgroundImage,
          backgroundSize,
          backgroundPosition,
          backgroundRepeat,
          backgroundColor,
          paddingTop,
          paddingRight,
          paddingBottom,
          paddingLeft,
        },
        content: {
          ...rest,
        },
        wrapper: {
          width,
          height,
          minWidth,
          maxWidth,
          minHeight,
          maxHeight,
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
        },
      }}
      title={label}
      footer={(
        <Space>
          <Button onClick={onCancelHandler} disabled={cancelButtonDisabled}>
            {cancelText || 'Cancel'}
          </Button>

          <Button type="primary" onClick={onOkHandler} disabled={okButtonDisabled}>
            {okText || 'Ok'}
          </Button>
        </Space>
      )}
    >
      <ParentProvider model={props} name="ShaDrawer">
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
