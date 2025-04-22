import React, { FC } from 'react';
import {
  CheckCircleOutlined,
  CopyOutlined,
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
  } from 'antd';
import { FormMarkupWithSettings } from '@/providers/form/models';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { useHttpClient } from '@/providers';
import {
  updateItemStatus,
} from '@/utils/configurationFramework/actions';
import { getFormFullName } from '@/utils/form';
import { StatusTag } from '@/components';
import { useStyles } from '../styles/styles';


type MenuItem = MenuProps['items'][number];

export interface ISaveMenuProps {
  onSaved?: () => void;
}

export const SaveMenu: FC<ISaveMenuProps> = ({ onSaved }) => {
  const { loadForm, saveForm, formProps } = useFormPersister();
  const formFlatMarkup = useFormDesignerStateSelector(x => x.formFlatMarkup);
  const formSettings = useFormDesignerStateSelector(x => x.formSettings);
  const toolboxComponents = useFormDesignerComponents();
  const httpClient = useHttpClient();
  const { message, modal } = App.useApp();

  const { styles } = useStyles();

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

  const copyFormName = () => {
    navigator.clipboard.writeText(fullName);
    message.success("Form name copied");
  };

  const onSaveAndSetReadyClick = () => {
    const onOk = () => {
      message.loading('Saving and setting ready..', 0);
      saveFormInternal()
        .then(() => {
          updateItemStatus({
            httpClient,
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
            message,
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
    modal.confirm({
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
    <div
    className={styles.formNameParent}
    >
      <Dropdown.Button
        icon={<DownOutlined />}
        menu={{ items: saveMenuItems }}
        onClick={onSaveClick}
        type="primary"
      >
        <SaveOutlined />
      </Dropdown.Button>
      <p
        className={styles.formName}
        title={fullName}
        onClick={()=>copyFormName()}
      >
        <span className={styles.formTitle}> {fullName}
        </span>
        <CopyOutlined color='#555' size={12} title={fullName}/>
        <StatusTag value={formProps.versionStatus} mappings={CONFIGURATION_ITEM_STATUS_MAPPING} color={null} />
      </p>
    </div>

  );
};