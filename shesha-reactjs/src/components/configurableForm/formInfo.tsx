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
  const { toggleShowInfoBlock, formInfoBlockVisible } = useAppConfigurator();
  const { styles } = useStyles();

  const [open, setOpen] = useState(false);
  const [panelShowing, setPanelShowing] = useState<boolean>(true);
  const [allowHidePanel, setAllowHidePanel] = useState<boolean>(false);

  const onModalOpen = () => setOpen(true);
  const onUpdated = () => {
    if (onMarkupUpdated)
      onMarkupUpdated();
    setOpen(false);
  };

useEffect(()=>{
  if(allowHidePanel === true) {
    setPanelShowing(visible)
  }
},[visible])

useEffect(()=>{
  if(formInfoBlockVisible === true){
    setPanelShowing(true);
    setTimeout(()=>{setPanelShowing(false); setAllowHidePanel(true)},3000)
  }
}, [formInfoBlockVisible])

  return (
    <Card
      className={styles.shaFormInfoCard}
      style={{ top: panelShowing ? '-2px' : '-42px', opacity: panelShowing ? '1' : '0', zIndex: '2', position: 'absolute', transition: '.3s'}}
      title={
        <div style={{marginTop: "-4px"}}>
          {id && (
            <Button style={{ padding: 0 }} type="link" onClick={onModalOpen}>
              <EditOutlined color='red' title="Click to open this form in the designer" />
            </Button>
          )}
          <span className={styles.shaFormInfoCardTitle}>
            {getFormFullName(module, name)} v{versionNo}
          </span>
          {false && <HelpTextPopover content={description}></HelpTextPopover>}
          <StatusTag value={versionStatus} mappings={CONFIGURATION_ITEM_STATUS_MAPPING} color={null}></StatusTag>
        </div>
      }
      extra={<CloseOutlined onClick={() => toggleShowInfoBlock(false)} title="Click to hide form info" />}
      size="small"
    >
      <div className={styles.shaCurvedEnd}></div>

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
