import { Modal, Skeleton } from 'antd';
import React, { FC } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { FormMode, SubFormProvider, useAppConfigurator, useForm } from '../../../../providers';
import { IFormMarkupResponse } from '../../../../providers/form/api';
import { ConfigurationItemVersionStatusMap } from '../../../../utils/configurationFramework/models';
import { GHOST_PAYLOAD_KEY } from '../../../../utils/form';
import FormInfo from '../../../configurableForm/formInfo';
import Show from '../../../show';
import ValidationErrors from '../../../validationErrors';
import SubForm from '../subForm/subForm';
import { IChildEntitiesTagGroupProps, IChildEntitiesTagGroupSelectOptions } from './models';
import { formatOptions, getChildEntitiesFormInfo } from './utils';

interface IProps extends IChildEntitiesTagGroupProps {
  data?: IFormMarkupResponse['formConfiguration'];
  error: IFormMarkupResponse['error'] | any;
  formMode?: FormMode;
  initialValues?: IChildEntitiesTagGroupSelectOptions;
  labelExecutor: Function;
  labelKeys: string[];
  loading: boolean;
  open: boolean;
  onSetData: Function;
  onToggle: Function;
}

const ChildEntitiesTagGroupModal: FC<IProps> = ({
  data,
  error,
  formMode,
  initialValues,
  labelExecutor,
  labelKeys,
  loading,
  modalTitle: title,
  modalWidth: width = '60%',
  name,
  open,
  onSetData,
  onToggle,
}) => {
  const { formData, form } = useForm();

  const { formInfoBlockVisible } = useAppConfigurator();

  useDeepCompareEffect(() => {
    if (open && initialValues?.metadata) {
      form.setFieldsValue({ [mutatedName]: initialValues?.metadata });
    }
  }, [open, initialValues?.metadata]);

  const onOk = () => {
    onSetData(formatOptions(formData?.[mutatedName], labelExecutor, labelKeys, initialValues));
    onCancel();
  };

  const onCancel = () => {
    onToggle(false);
    form.setFieldsValue({ [mutatedName]: undefined });
  };

  const mutatedName = `${GHOST_PAYLOAD_KEY}_${name}`;
  const markup = {
    components: data?.markup,
    formSettings: data?.settings,
  };

  const showFormInfo = !!data && formInfoBlockVisible && !!ConfigurationItemVersionStatusMap?.[data?.versionStatus];

  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      title={title}
      width={width}
      okButtonProps={{ disabled: formMode === 'readonly' }}
    >
      <Skeleton loading={loading}>
        <Show when={showFormInfo}>
          <FormInfo {...getChildEntitiesFormInfo(data)} />
        </Show>

        <ValidationErrors error={error} />

        <SubFormProvider name={mutatedName} markup={markup} properties={[]} defaultValue={initialValues?.metadata}>
          <SubForm readOnly={formMode === 'readonly'} />
        </SubFormProvider>
      </Skeleton>
    </Modal>
  );
};

export default ChildEntitiesTagGroupModal;
