import React, { FC, useState } from 'react';
import { Button, Dropdown, Menu, message, Modal } from 'antd';
import {
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  BugOutlined,
  EyeOutlined,
  SettingOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  DownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useForm } from '../../providers/form';
import { useFormPersister } from '../../providers/formPersisterProvider';
import { useFormDesigner } from '../../providers/formDesigner';
import { componentsFlatStructureToTree, useFormDesignerComponents } from '../../providers/form/utils';
import { FormMarkupWithSettings } from '../../providers/form/models';
import FormSettingsEditor from './formSettingsEditor';
import { ConfigurationItemVersionStatus } from '../../utils/configurationFramework/models';
import { createNewVersionRequest, showErrorDetails, updateItemStatus } from '../../utils/configurationFramework/actions';
import { useShaRouting, useSheshaApplication } from '../..';

export interface IProps { }

export const FormDesignerToolbar: FC<IProps> = () => {
  const { loadForm, saveForm, formProps } = useFormPersister();
  const { backendUrl, httpHeaders, routes } = useSheshaApplication();
  const { router } = useShaRouting(false) ?? {};
  const { setFormMode, formMode } = useForm();
  const { setDebugMode, isDebug, undo, redo, canUndo, canRedo, readOnly } = useFormDesigner();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const { allComponents, componentRelations, formSettings } = useFormDesigner();
  const toolboxComponents = useFormDesignerComponents();

  const saveFormInternal = (): Promise<void> => {
    const payload: FormMarkupWithSettings = {
      components: componentsFlatStructureToTree(toolboxComponents, { allComponents, componentRelations }),
      formSettings: formSettings,
    };
    return saveForm(payload);
  }

  const onSaveClick = () => {
    message.loading('Saving..', 0);
    saveFormInternal()
      .then(() => {
        message.destroy();
        message.success('Form saved successfully')
      })
      .catch(() => {
        message.destroy();
        message.error('Failed to save form')
      });
  };

  const onSaveAndSetReadyClick = () => {
    const onOk = () => {
      message.loading('Saving and setting ready..', 0);
      saveFormInternal()
        .then(() => {
          updateItemStatus({
            backendUrl: backendUrl,
            httpHeaders: httpHeaders,
            id: formProps.id,
            status: ConfigurationItemVersionStatus.Ready,
            onSuccess: () => {
              message.destroy();
              message.success('Form saved and set ready successfully')
              loadForm({ skipCache: true });
            },
          }).catch(() => {
            message.destroy();
            message.error('Failed to set form ready');
          });
        })
        .catch(() => {
          message.destroy();
          message.error('Failed to save form');
        });
    }
    Modal.confirm({
      title: 'Save and Set Ready',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to set this form ready?',
      okText: 'Yes',
      cancelText: 'No',
      onOk
    });
  }

  const onUndoClick = () => {
    undo();
  };

  const onRedoClick = () => {
    redo();
  };

  const onSettingsClick = () => {
    setSettingsVisible(true);
  };

  const onCreateNewVersionClick = () => {
    const onOk = () => {
      message.loading('Creating new version..', 0);
      return createNewVersionRequest({
        backendUrl: backendUrl,
        httpHeaders: httpHeaders,
        id: formProps.id,
      })
        .then(response => {
          message.destroy();

          const newVersionId = response.data.result.id;
          const url = `${routes.formsDesigner}?id=${newVersionId}`;
          if (router)
            router.push(url);
          else
            console.log('router not available, url: ', url);

          message.info('New version created successfully', 3);
        })
        .catch(e => {
          message.destroy();
          showErrorDetails(e);
        });
    }
    Modal.confirm({
      title: 'Create New Version',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to create new version of the form?',
      okText: 'Yes',
      cancelText: 'No',
      onOk
    });
  }

  const onPublishClick = () => {
    const onOk = () => {
      message.loading('Publishing in progress..', 0);
      updateItemStatus({
        backendUrl: backendUrl,
        httpHeaders: httpHeaders,
        id: formProps.id,
        status: ConfigurationItemVersionStatus.Live,
        onSuccess: () => {
          message.success('Form published successfully')
          loadForm({ skipCache: true });
        },
      });
    }
    Modal.confirm({
      title: 'Publish Item',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to publish this form?',
      okText: 'Yes',
      cancelText: 'No',
      onOk
    });
  }

  const saveMenu = <Menu
    items={[
      {
        label: (<><SaveOutlined /> Save</>),
        key: 'save',
        onClick: onSaveClick,
      },
      {
        label: (<><CheckCircleOutlined /> Save and Set Ready</>),
        key: 'save-set-ready',
        onClick: onSaveAndSetReadyClick,
      },
    ]}
  />;

  return (
    <div className="sha-designer-toolbar">
      <div className="sha-designer-toolbar-left">
        {!readOnly && (
          <Dropdown.Button
            icon={<DownOutlined />}
            overlay={saveMenu}
            onClick={onSaveClick}
            type='primary'
          >
            <SaveOutlined /> Save
          </Dropdown.Button>
        )}
        {formProps.isLastVersion && (formProps.versionStatus === ConfigurationItemVersionStatus.Live || formProps.versionStatus === ConfigurationItemVersionStatus.Cancelled) && (
          <Button onClick={onCreateNewVersionClick} type="link">
            <BranchesOutlined /> Create New Version
          </Button>
        )}
        {formProps.isLastVersion && formProps.versionStatus === ConfigurationItemVersionStatus.Ready && (
          <Button onClick={onPublishClick} type="link">
            <DeploymentUnitOutlined /> Publish
          </Button>
        )}
        {/* <Button onClick={onHistoryClick} type="link">
          History
        </Button> */}
      </div>
      <div className="sha-designer-toolbar-right">
        <Button icon={<SettingOutlined />} type="link" onClick={onSettingsClick}>
          Settings
        </Button>
        <FormSettingsEditor
          readOnly={readOnly}
          isVisible={settingsVisible}
          close={() => {
            setSettingsVisible(false);
          }}
        />
        <Button
          onClick={() => {
            setFormMode(formMode === 'designer' ? 'edit' : 'designer');
          }}
          type={formMode === 'designer' ? 'default' : 'primary'}
          shape="circle"
          title='Preview'
        >
          <EyeOutlined />
        </Button>
        <Button
          key="debug"
          onClick={() => {
            setDebugMode(!isDebug);
          }}
          title="Debug"
          type={isDebug ? 'primary' : 'ghost'}
          shape="circle"
        >
          <BugOutlined />
        </Button>

        {!readOnly && (
          <>
            <Button key="undo" shape="circle" onClick={onUndoClick} disabled={!canUndo} title="Undo">
              <UndoOutlined />
            </Button>
            <Button key="redo" shape="circle" onClick={onRedoClick} disabled={!canRedo} title="Redo">
              <RedoOutlined />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FormDesignerToolbar;
