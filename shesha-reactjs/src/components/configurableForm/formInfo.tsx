import React, { FC, useState } from 'react';
import { useAppConfigurator } from '@/providers';
import { IPersistedFormProps } from '@/providers/form/models';
import { Button, Card } from 'antd';
import { CONFIGURATION_ITEM_STATUS_MAPPING } from '@/utils/configurationFramework/models';
import { getFormFullName } from '@/utils/form';
import StatusTag from '@/components/statusTag';
import HelpTextPopover from '@/components/helpTextPopover';
import { BlockOutlined, CloseOutlined } from '@ant-design/icons';
import { QuickEditDialog } from '../formDesigner/quickEdit/quickEditDialog';

export interface FormInfoProps {
  /**
   * Persisted form props
   */
  formProps: IPersistedFormProps;
  /**
   * Is used for update of the form markup. If value of this handler is not defined - the form is read-only
   */
  onMarkupUpdated?: () => void;
}

export const FormInfo: FC<FormInfoProps> = ({ formProps, onMarkupUpdated }) => {
  const { id, versionNo, description, versionStatus, name, module } = formProps;
  const { toggleShowInfoBlock } = useAppConfigurator();

  const [open, setOpen] = useState(false);

  const onModalOpen = () => setOpen(true);
  const onUpdated = () => {
    console.log('LOG: markup updated!');
    if (onMarkupUpdated)
      onMarkupUpdated();
    setOpen(false);
  };

  return (
    <Card
      className="sha-form-info-card"
      bordered
      title={
        <>
          {id && (
            <Button style={{ padding: 0 }} type="link" onClick={onModalOpen}>
              <BlockOutlined title="Click to open this form in the designer" />
            </Button>
          )}
          <span className="sha-form-info-card-title">
            Form: {getFormFullName(module, name)} v{versionNo}
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
