import { useFormPersister } from '@/providers/formPersisterProvider';
import { getFormFullName } from '@/utils/form';
import { CopyOutlined } from '@ant-design/icons';
import { App } from 'antd';
import React, { FC } from 'react';
import { useStyles } from '../styles/styles';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export const FormName: FC = () => {
  const { formProps } = useFormPersister();
  const { message } = App.useApp();

  const { styles } = useStyles();

  const fullName = formProps && !isNullOrWhiteSpace(formProps.name)
    ? getFormFullName(formProps.module ?? null, formProps.name)
    : "";

  const copyFormName = async (): Promise<void> => {
    await navigator.clipboard.writeText(fullName);
    message.success("Form name copied");
  };

  return (
    <p
      className={styles.formName}
      title={fullName}
      onClick={() => copyFormName()}
    >
      <span className={styles.formTitle}> {fullName}
      </span>
      <CopyOutlined color="#555" size={12} title={fullName} />
    </p>
  );
};
