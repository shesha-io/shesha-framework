import { Modal, Skeleton } from 'antd';
import { useDataContext } from 'providers/dataContextProvider/index';
import React, { FC } from 'react';
import { useAppConfigurator } from '../../../../providers';
import { IFormMarkupResponse } from '../../../../providers/form/api';
import { ConfigurationItemVersionStatusMap } from '../../../../utils/configurationFramework/models';
import FormInfo from '../../../configurableForm/formInfo';
import Show from '../../../show';
import ValidationErrors from '../../../validationErrors';
import SubForm from '../subForm/subForm';
import { IChildEntitiesTagGroupProps } from './models';

interface IProps extends IChildEntitiesTagGroupProps {
  formInfo?: IFormMarkupResponse['formConfiguration'];
  error: IFormMarkupResponse['error'] | any;
  readOnly?: boolean;
  loading: boolean;
  open: boolean;
  onToggle: Function;
  onChange: (data: any) => void;
}

const ChildEntitiesTagGroupModal: FC<IProps> = ({
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
  const context = useDataContext();

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
          Shurik!
          <Skeleton loading={loading}>
            <Show when={showFormInfo}>
              <FormInfo {...formInfo} />
            </Show>

            <ValidationErrors error={error} />

              <SubForm readOnly={readOnly} />
          </Skeleton>
        </Modal>
  );
};

export default ChildEntitiesTagGroupModal;
