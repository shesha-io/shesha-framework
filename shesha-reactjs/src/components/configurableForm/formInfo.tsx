import React, { FC, useEffect, useState } from 'react';
import { useAppConfigurator } from '@/providers';
import { IPersistedFormProps } from '@/providers/form/models';
import { Button } from 'antd';
import { CONFIGURATION_ITEM_STATUS_MAPPING } from '@/utils/configurationFramework/models';
import { getFormFullName } from '@/utils/form';
import StatusTag from '@/components/statusTag';
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
  const { id, versionNo, versionStatus, name, module } = formProps;
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
    setPanelShowing(false);
    setAllowHidePanel(true);
  }
}, [formInfoBlockVisible]);

  return (
<div
  className={`${styles.shaFormInfoCard}`}
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: panelShowing ? '-2px' : '-22px',
    opacity: panelShowing ? '1' : '0',
    zIndex: 2,
    position: 'absolute',
    transition: '.3s',
    height: '35px',
    background: 'rgba(0, 0, 255, .75)',
    maxWidth: '100%',
    width: 'auto',
    padding: '0 5px',
    margin: 5,
    borderRadius: 5,
    //borderBottomRightRadius: '20px'
  }}
>
  {id && (
    <Button type="link" onClick={onModalOpen} style={{ padding: 0 }}>
      <EditOutlined style={{ color: "#FFFFFF" }} title="Click to open this form in the designer" />
    </Button>
  )}

  <p title={`${getFormFullName(module, name)} v${versionNo}`} style={{ marginLeft: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1, color: '#fff', fontSize: 12, textShadow: '0px 0px 2px rgba(0,0,0,.45)' }}>
    {getFormFullName(module, name)} v{versionNo}
  </p>
  
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <StatusTag value={versionStatus} mappings={CONFIGURATION_ITEM_STATUS_MAPPING} color={null} style={{ marginRight: '5px' }} />
    <CloseOutlined onClick={() => toggleShowInfoBlock(false)} title="Click to hide form info" style={{ color: '#FFFFFF' }} />
  </div>

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
