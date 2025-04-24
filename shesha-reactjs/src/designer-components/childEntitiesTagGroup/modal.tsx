import { Modal, Skeleton } from 'antd';
import React, { FC } from 'react';
import { useAppConfigurator, useDataContextManagerActions } from '@/providers';
import { IFormMarkupResponse } from '@/providers/form/api';
import { ConfigurationItemVersionStatusMap } from '@/utils/configurationFramework/models';
import ValidationErrors from '@/components/validationErrors';
import SubForm from '../subForm/subForm';
import { IChildEntitiesTagGroupProps } from './models';
import FormInfo from '@/components/configurableForm/formInfo';

interface IProps extends IChildEntitiesTagGroupProps {
  contextId: string;
  formInfo?: IFormMarkupResponse['formConfiguration'];
  error: IFormMarkupResponse['error'] | any;
  readOnly?: boolean;
  loading: boolean;
  open: boolean;
  onToggle: Function;
  onChange: (data: any) => void;
}

const ChildEntitiesTagGroupModal: FC<IProps> = ({
  contextId,
  formInfo,
  error,
  readOnly,
  loading,
  modalTitle: title,
  modalWidth: width = '60%',
  open,
  onToggle,
  onChange
}) => {
  const { formInfoBlockVisible } = useAppConfigurator();
  const context = useDataContextManagerActions().getDataContext(contextId);

  const onOk = () => {
    onChange(context.getData());
    onToggle(false);
  };

  const onCancel = () => {
    onToggle(false);
  };

  const showFormInfo = !!formInfo && formInfoBlockVisible && !!ConfigurationItemVersionStatusMap?.[formInfo?.versionStatus];

  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      title={title}
      width={width}
      okButtonProps={{ disabled: readOnly }}
    >
      <FormInfo visible={showFormInfo} formProps={formInfo}>
        <Skeleton loading={loading}>
          <ValidationErrors error={error} />
          <SubForm readOnly={readOnly} />
        </Skeleton>
      </FormInfo>
    </Modal>
  );
};

export default ChildEntitiesTagGroupModal;
