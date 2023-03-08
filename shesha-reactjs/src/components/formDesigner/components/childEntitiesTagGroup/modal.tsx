import { Modal } from 'antd';
import React, { FC, useEffect } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { FormMode, SubFormProvider, useForm } from '../../../../providers';
import { useFormConfiguration } from '../../../../providers/form/api';
import { GHOST_PAYLOAD_KEY } from '../../../../utils/form';
import ValidationErrors from '../../../validationErrors';
import SubForm from '../subForm/subForm';
import { IChildEntitiesTagGroupProps, IChildEntitiesTagGroupSelectOptions } from './models';
import { formatOptions } from './utils';

interface IProps extends IChildEntitiesTagGroupProps {
  formMode?: FormMode;
  initialValues?: IChildEntitiesTagGroupSelectOptions;
  labelKey: string;
  open: boolean;
  onSetData: Function;
  onToggle: Function;
}

const ChildEntitiesTagGroupModal: FC<IProps> = ({
  formId: formIdentity,
  formMode,
  initialValues,
  labelKey,
  modalWidth,
  name,
  open,
  onSetData,
  onToggle,
}) => {
  const { formData, form } = useForm();

  const { formConfiguration, refetch: refetchFormConfig, error: fetchFormError } = useFormConfiguration({
    formId: formIdentity,
    lazy: true,
  });

  useEffect(() => {
    if (formIdentity) {
      refetchFormConfig();
    }
  }, [formIdentity]);

  useDeepCompareEffect(() => {
    if (open && initialValues?.metadata) {
      form.setFieldsValue({ [mutatedName]: initialValues?.metadata });
    }
  }, [open, initialValues?.metadata]);

  const onOk = () => {
    onSetData(formatOptions(formData?.[mutatedName], labelKey, initialValues));
    onCancel();
  };

  const onCancel = () => {
    onToggle(false);
    form.setFieldsValue({ [mutatedName]: undefined });
  };

  const mutatedName = `${GHOST_PAYLOAD_KEY}_${name}`;
  const markup = {
    components: formConfiguration?.markup,
    formSettings: formConfiguration?.settings,
  };

  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={modalWidth || '60%'}
      okButtonProps={{ disabled: formMode === 'readonly' }}
    >
      <ValidationErrors error={fetchFormError} />

      <SubFormProvider name={mutatedName} markup={markup} properties={[]} defaultValue={initialValues?.metadata}>
        <SubForm readOnly={formMode === 'readonly'} />
      </SubFormProvider>
    </Modal>
  );
};

export default ChildEntitiesTagGroupModal;
