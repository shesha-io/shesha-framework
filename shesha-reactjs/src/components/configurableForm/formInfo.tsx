import React, { FC } from 'react';
import { useAppConfigurator, useSheshaApplication } from '@/providers';
import { FormIdentifier, IPersistedFormProps } from '@/providers/form/models';
import { Card } from 'antd';
import { CONFIGURATION_ITEM_STATUS_MAPPING } from '@/utils/configurationFramework/models';
import { getFormFullName } from '@/utils/form';
import StatusTag from '@/components/statusTag';
import HelpTextPopover from '@/components/helpTextPopover';
import { BlockOutlined, CloseOutlined } from '@ant-design/icons';

export const FormInfo: FC<IPersistedFormProps> = ({ id, versionNo, description, versionStatus, name, module }) => {
  const { toggleShowInfoBlock } = useAppConfigurator();
  const app = useSheshaApplication();

  const getDesignerUrl = (fId: FormIdentifier) => {
    return typeof fId === 'string'
      ? `${app.routes.formsDesigner}?id=${fId}`
      : Boolean(fId?.name)
      ? `${app.routes.formsDesigner}?module=${fId.module}&name=${fId.name}`
      : null;
  };

  return (
    <Card
      className="sha-form-info-card"
      bordered
      title={
        <>
          {id && (
            <a target="_blank" href={getDesignerUrl(id)}>
              <BlockOutlined title="Click to open this form in the designer" />
            </a>
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
    ></Card>
  );
};

export default FormInfo;
