import { useFormPersister } from '@/providers/formPersisterProvider';
import { getFormFullName } from '@/utils/form';
import { CopyOutlined } from '@ant-design/icons';
import { App } from 'antd';
import React, { FC } from 'react';
import { useStyles } from '../styles/styles';

export const FormName: FC = () => {
  const { formProps } = useFormPersister();
  const { message } = App.useApp();

  const { styles } = useStyles();

  const fullName = formProps ? getFormFullName(formProps.module, formProps.name) : null;

  const copyFormName = (): void => {
    navigator.clipboard.writeText(fullName);
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
