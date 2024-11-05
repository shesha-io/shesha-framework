import React, { FC } from 'react';
import {
  CheckCircleOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { componentsFlatStructureToTree } from '@/providers/form/utils';
import { CONFIGURATION_ITEM_STATUS_MAPPING, ConfigurationItemVersionStatus } from '@/utils/configurationFramework/models';
import {
  App,
  Dropdown,
  MenuProps,
  Modal
} from 'antd';
import { FormMarkupWithSettings } from '@/providers/form/models';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { useSheshaApplication } from '@/providers';
import {
  updateItemStatus,
} from '@/utils/configurationFramework/actions';
import { getFormFullName } from '@/utils/form';
import { StatusTag } from '@/components';


type MenuItem = MenuProps['items'][number];

export interface ISaveMenuProps {
  onSaved?: () => void;
}

export const SaveMenu: FC<ISaveMenuProps> = ({ onSaved }) => {
  const { loadForm, saveForm, formProps } = useFormPersister();
  const { formFlatMarkup, formSettings } = useFormDesignerState();
  const toolboxComponents = useFormDesignerComponents();
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const { message } = App.useApp();

  const fullName = formProps ? getFormFullName(formProps.module, formProps.name) : null;

  const saveFormInternal = (): Promise<void> => {
    const payload: FormMarkupWithSettings = {
      components: componentsFlatStructureToTree(toolboxComponents, formFlatMarkup),
      formSettings: formSettings,
    };
    return saveForm(payload);
  };

  const onSaveClick = () => {
    message.loading('Saving..', 0);
    saveFormInternal()
      .then(() => {
        message.destroy();

        if (onSaved)
          onSaved();
        else {
          message.success('Form saved successfully');
        }
      })
      .catch(() => {
        message.destroy();
        message.error('Failed to save form');
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
              if (onSaved)
                onSaved();
              else {
                message.success('Form saved and set ready successfully');
                loadForm({ skipCache: true });
              }
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
    };
    Modal.confirm({
      title: 'Save and Set Ready',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to set this form ready?',
      okText: 'Yes',
      cancelText: 'No',
      onOk,
    });
  };

  const saveMenuItems: MenuItem[] = [
    {
      label: (
        <>
          <SaveOutlined /> Save
        </>
      ),
      key: 'save',
      onClick: onSaveClick,
    },
    {
      label: (
        <>
          <CheckCircleOutlined /> Save and Set Ready
        </>
      ),
      key: 'save-set-ready',
      onClick: onSaveAndSetReadyClick,
    },
  ];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      marginTop: "-10px"
    }}>
      <Dropdown.Button
        icon={<DownOutlined />}
        menu={{ items: saveMenuItems }}
        onClick={onSaveClick}
        type="primary"
      >
        <SaveOutlined />
      </Dropdown.Button>
      <p style={{
        marginLeft: '-90px',
        marginTop: '13px',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'row',
        cursor: 'pointer',
        userSelect: 'none',
        transition: '.2s'
      }}
        onSelect={(e) => e.preventDefault()}
        onDoubleClick={(event) => {
          //@ts-ignore
          event.target.style.backgroundColor = "#f2f2f2";
          setTimeout(() => {
            //@ts-ignore
            event.target.style.backgroundColor = "#ffffff";
          }, 400);
          navigator.clipboard.writeText(fullName);
        }}
        title='Double-click to copy full form name'
      >
        <span style={{
          margin: 0,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          marginLeft: '100px',
          maxWidth: '150px',
        }}
        > {fullName}
        </span>
        <StatusTag value={formProps.versionStatus} mappings={CONFIGURATION_ITEM_STATUS_MAPPING} color={null} />
      </p>
    </div>

  );
};