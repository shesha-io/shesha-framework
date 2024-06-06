import React, { FC, useEffect, useState } from 'react';
import { useAppConfigurator } from '@/providers';
import { IPersistedFormProps } from '@/providers/form/models';
import { Button } from 'antd';
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
    setPanelShowing(visible);
  }
},[visible]);

useEffect(()=>{
  if(formInfoBlockVisible === true){
    setPanelShowing(true);
    setTimeout(()=>{
setPanelShowing(false); setAllowHidePanel(true);
},3000);
  }
}, [formInfoBlockVisible]);

  return (
<div
  className={`${styles.shaFormInfoCard}`}
  style={{
    top: panelShowing ? '-2px' : '-22px',
    opacity: panelShowing ? '1' : '0',
    zIndex: '2',
    position: 'absolute',
    transition: '.3s'
  }}
>
<div style={{ display: 'flex', alignItems: 'center' }}>
      {id && (
        <Button type="link" onClick={onModalOpen} style={{transform: 'skew(45deg)', marginLeft: "-10px"}}>
          <EditOutlined style={{color: "#FFFFFF"}} title="Click to open this form in the designer" />
        </Button>
      )}
      <p className={styles.shaFormInfoCardTitle} title={`${getFormFullName(module, name)} v${versionNo}`} style={{ marginLeft: id ? '-8px' : '0', transform: 'skew(45deg)'}}>
        {getFormFullName(module, name)} v{versionNo}
      </p>
      {false && <HelpTextPopover content={description}></HelpTextPopover>}
      <StatusTag value={versionStatus} mappings={CONFIGURATION_ITEM_STATUS_MAPPING} color={null} style={{ marginLeft: '7px', transform: 'skew(45deg)' }}></StatusTag>
    </div>

    <CloseOutlined onClick={() => toggleShowInfoBlock(false)} title="Click to hide form info"  style={{transform: 'skew(45deg)', marginLeft: '0px', color: '#FFFFFF'}}/>

  {id && open && (
    <QuickEditDialog
      formId={id}
      open={open}
      onCancel={() => setOpen(false)}
      onUpdated={onUpdated}
    />
  )}
</div>

  );
};

export default FormInfo;
