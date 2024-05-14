import React, { FC, useEffect, useState } from 'react';
import { useAppConfigurator } from '@/providers';
import { IPersistedFormProps } from '@/providers/form/models';
import { Button, Card } from 'antd';
import { CONFIGURATION_ITEM_STATUS_MAPPING } from '@/utils/configurationFramework/models';
import { getFormFullName } from '@/utils/form';
import StatusTag from '@/components/statusTag';
import HelpTextPopover from '@/components/helpTextPopover';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { QuickEditDialog } from '../formDesigner/quickEdit/quickEditDialog';
import { useStyles } from './styles/styles';

export interface FormInfoProps {
  /**
   * Persisted form props
   */
  formProps: IPersistedFormProps;
  visible?: boolean;
  /**
   * Is used for update of the form markup. If value of this handler is not defined - the form is read-only
   */
  onMarkupUpdated?: () => void;
}

export const FormInfo: FC<FormInfoProps> = ({ formProps, onMarkupUpdated, visible }) => {
  const { id, versionNo, description, versionStatus, name, module } = formProps;
  const { toggleShowInfoBlock } = useAppConfigurator();
  const { styles } = useStyles();

  const [open, setOpen] = useState(false);
  const [panelShowing, setPanelShowing] = useState<boolean>();

  const onModalOpen = () => setOpen(true);
  const onUpdated = () => {
    if (onMarkupUpdated)
      onMarkupUpdated();
    setOpen(false);
  };

useEffect(()=>{
  setPanelShowing(visible)
  console.log(visible, "VISIBILITY PROP")
},[visible])

  return (
    <Card
      className={styles.shaFormInfoCard}
      style={{background: '#00ffff', border: 'none', minWidth: '300px', width: '350px', borderRadius: '0px', left: '-2px', top: panelShowing ? '-2px' : '-42px', opacity: panelShowing ? '1' : '0', zIndex: '2', position: 'absolute', transition: '.3s'}}
      title={
        <>
          {id && (
            <Button style={{ padding: 0 }} type="link" onClick={onModalOpen}>
              <EditOutlined title="Click to open this form in the designer" />
            </Button>
          )}
          <span className={styles.shaFormInfoCardTitle}>
            {getFormFullName(module, name)} v{versionNo}
          </span>
          {false && <HelpTextPopover content={description}></HelpTextPopover>}
          <StatusTag value={versionStatus} mappings={CONFIGURATION_ITEM_STATUS_MAPPING} color={null}></StatusTag>
        </>
      }
      extra={<CloseOutlined onClick={() => toggleShowInfoBlock(false)} title="Click to hide form info" />}
      size="small"
    >
      {id && open && (
        <QuickEditDialog
          formId={id}
          open={open}
          onCancel={() => setOpen(false)}
          onUpdated={onUpdated}
        />
      )}
    </Card>
  );
};

export default FormInfo;
