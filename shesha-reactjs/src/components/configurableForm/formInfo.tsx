import React, { FC, useEffect, useState } from 'react';
import { useAppConfigurator, useAuthOrUndefined } from '@/providers';
import { IPersistedFormProps } from '@/providers/form/models';
import { Button } from 'antd';
import { getFormFullName } from '@/utils/form';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { QuickEditDialog } from '../formDesigner/quickEdit/quickEditDialog';
import { useStyles } from './styles/styles';
import classNames from 'classnames';

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

export const FormInfo: FC<FormInfoProps> = ({ formProps, onMarkupUpdated, children }) => {
  const { id, name, module } = formProps;
  const { toggleShowInfoBlock, formInfoBlockVisible, softInfoBlock } = useAppConfigurator();
  const { styles } = useStyles();

  const auth = useAuthOrUndefined();

  const [open, setOpen] = useState(false);
  const [panelShowing, setPanelShowing] = useState<boolean>(formInfoBlockVisible);
  const displayEditMode = formInfoBlockVisible && formProps?.id;

  const onModalOpen = (): void => setOpen(true);
  const onUpdated = (): void => {
    if (onMarkupUpdated) {
      onMarkupUpdated();
    }
    setOpen(false);
  };

  useEffect(() => {
    if (displayEditMode)
      setPanelShowing(softInfoBlock);
  }, [softInfoBlock]);

  if (!formProps?.id) {
    return <>{children}</>;
  }

  if (auth?.state?.status !== 'ready') {
    return <>{children}</>;
  }

  return (
    <div
      onMouseEnter={(event) => {
        event.stopPropagation();
        if (Boolean(displayEditMode)) setPanelShowing(true);
      }}
      onMouseLeave={(event) => {
        event.stopPropagation();
        if (Boolean(displayEditMode)) setPanelShowing(false);
      }}
      className={classNames(styles.shaFormContainer, { [styles.shaEditMode]: displayEditMode })}
    >

      <div
        className={`${styles.shaFormInfoCardParent}`}
        style={{
          height: Boolean(displayEditMode) ? '40px' : '0px',
        }}
      >
        <div
          className={`${styles.shaFormInfoCard}`}
          style={{
            top: panelShowing && formProps.id ? '-1px' : '-28px',
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
              onClick={() => onModalOpen()}
              title={getFormFullName(module, name)}
              className={styles.shaFormInfoCardTitle}
            >
              {getFormFullName(module, name)}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', paddingRight: 5 }}>
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
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default FormInfo;
