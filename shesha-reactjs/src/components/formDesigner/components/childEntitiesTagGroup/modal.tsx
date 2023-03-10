import { Modal, Skeleton } from 'antd';
import React, { FC, useEffect } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { FormMode, SubFormProvider, useAppConfigurator, useForm } from '../../../../providers';
import { useFormConfiguration } from '../../../../providers/form/api';
import { ConfigurationItemVersionStatusMap } from '../../../../utils/configurationFramework/models';
import { GHOST_PAYLOAD_KEY } from '../../../../utils/form';
import FormInfo from '../../../configurableForm/formInfo';
import Show from '../../../show';
import ValidationErrors from '../../../validationErrors';
import SubForm from '../subForm/subForm';
import { IChildEntitiesTagGroupProps, IChildEntitiesTagGroupSelectOptions } from './models';
import { formatOptions, getChildEntitiesFormInfo } from './utils';

interface IProps extends IChildEntitiesTagGroupProps {
  formMode?: FormMode;
  initialValues?: IChildEntitiesTagGroupSelectOptions;
  labelExecutor: Function;
  labelKeys: string[];
  open: boolean;
  onSetData: Function;
  onToggle: Function;
}

const ChildEntitiesTagGroupModal: FC<IProps> = ({
  formId: formIdentity,
  formMode,
  initialValues,
  labelExecutor,
  labelKeys,
  modalTitle: title,
  modalWidth: width = '60%',
  name,
  open,
  onSetData,
  onToggle,
}) => {
  const { formData, form } = useForm();

  const { formConfiguration, refetch: refetchFormConfig, error, loading } = useFormConfiguration({
    formId: formIdentity,
    lazy: true,
  });

  const { formInfoBlockVisible } = useAppConfigurator();

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
    onSetData(formatOptions(formData?.[mutatedName], labelExecutor, labelKeys, initialValues));
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

  const showFormInfo =
    !!formConfiguration &&
    formInfoBlockVisible &&
    !!ConfigurationItemVersionStatusMap?.[formConfiguration?.versionStatus];

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
          <FormInfo {...getChildEntitiesFormInfo(formConfiguration)} />
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
