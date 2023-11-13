import { BlockOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import React, { FC, useState } from 'react';
import { useAppConfigurator, useSheshaApplication } from '../../../providers';
import { FormIdentifier, IPersistedFormProps } from '../../../providers/form/models';
import { CONFIGURATION_ITEM_STATUS_MAPPING } from '../../../utils/configurationFramework/models';
import { getFormFullName } from '../../../utils/form';
import HelpTextPopover from '../../helpTextPopover';
import StatusTag from '../../statusTag';
import Content from './content';
import { FormPersisterProvider } from 'providers/formPersisterProvider';

export const FormInfo: FC<IPersistedFormProps> = ({ id, versionNo, description, versionStatus, name, module }) => {
  const { toggleShowInfoBlock } = useAppConfigurator();
  const app = useSheshaApplication();
  const [open, setOpen] = useState(false);

  const getDesignerUrl = (fId: FormIdentifier) => {
    return typeof fId === 'string'
      ? `${app.routes.formsDesigner}?id=${fId}`
      : Boolean(fId?.name)
      ? `${app.routes.formsDesigner}?module=${fId.module}&name=${fId.name}`
      : null;
  };

  const onModalOpen = () => setOpen(true);

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
      {id && (
        <FormPersisterProvider formId={id} skipCache={true}>
          <Content id={id} forwardLink={getDesignerUrl(id)} open={open} onClose={() => setOpen(false)} />
        </FormPersisterProvider>
      )}
    </Card>
  );
};

export default FormInfo;
