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
  /**
   * The form component (or any component) that this will wrap
   */
  children?: React.ReactNode;
}

export const FormInfo: FC<FormInfoProps> = ({ formProps, onMarkupUpdated, visible, children }) => {
  const { id, versionNo, versionStatus, name, module } = formProps;
  const { toggleShowInfoBlock, formInfoBlockVisible } = useAppConfigurator();
  const { styles } = useStyles();

  const [open, setOpen] = useState(false);
  const [panelShowing, setPanelShowing] = useState<boolean>(formInfoBlockVisible);
  const [allowHidePanel, setAllowHidePanel] = useState<boolean>(false);
  const displayEditMode = formInfoBlockVisible && formProps?.id;

  const onModalOpen = () => setOpen(true);
  const onUpdated = () => {
    if (onMarkupUpdated) {
      onMarkupUpdated();
    }
    setOpen(false);
  };

  const toggleFormPanel = () => {
    if (allowHidePanel === true) {
      setPanelShowing(visible);
    }
  };

  const toggleFormBlock = () => {
    if (formInfoBlockVisible === true) {
      setPanelShowing(true);
      setAllowHidePanel(true);
    }
  };

  useEffect(() => {
    toggleFormBlock();
  }, [formInfoBlockVisible]);

  useEffect(() => {
    toggleFormPanel();
  }, [visible]);

  useEffect(()=>{
    if(Boolean(displayEditMode)) setTimeout(()=>{
      setPanelShowing(false);
    }, 3000);
  },[formInfoBlockVisible]);

  return (
    <div
      onMouseEnter={(event) => {
        event.stopPropagation();
        if(Boolean(displayEditMode)) setPanelShowing(true);
      }}
      onMouseLeave={(event) => {
        event.stopPropagation();
        if(Boolean(displayEditMode)) setPanelShowing(false);
      }}
      style={{
        border: Boolean(displayEditMode) ? '1px #10239e solid' : 'none',
        position: 'relative',
        transition: '.1s',
        overflow: 'hidden',
        padding: '3px',
      }}
    >
      <div
        className={`${styles.shaFormInfoCard}`}
        style={{
          top: panelShowing && formProps.id ? '-2px' : '-28px',
          opacity: panelShowing && formProps.id ? '1' : '0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transform: 'skew(30deg)',
          }}
        >
          {id && (
            <Button type="link" onClick={onModalOpen} style={{ padding: 0 }}>
              <EditOutlined
                style={{ color: '#FFFFFF' }}
                title="Click to open this form in the designer"
              />
            </Button>
          )}

          <p
            title={`${getFormFullName(module, name)} v${versionNo}`}
            className={styles.shaFormInfoCardTitle}>
            {getFormFullName(module, name)} v{versionNo}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 5 }}>
            <StatusTag
              value={versionStatus}
              mappings={CONFIGURATION_ITEM_STATUS_MAPPING}
              color={null}
              style={{ marginRight: '5px' }}
            />
            <CloseOutlined
              onClick={() => toggleShowInfoBlock(false)}
              title="Click to hide form info"
              style={{ color: '#FFFFFF' }}
            />
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
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default FormInfo;
