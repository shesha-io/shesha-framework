import HelpTextPopover from '@/components/helpTextPopover';
import React, { FC } from 'react';
import { getFormFullName } from '@/utils/form';
import { Space } from 'antd';
import { useFormPersister } from '@/providers/formPersisterProvider';


export interface IDesignerTitleProps {
}

export const DesignerTitle: FC<IDesignerTitleProps> = ({ }) => {
  const { formProps } = useFormPersister();
  const fullName = formProps ? getFormFullName(formProps.module, formProps.name) : null;
  const title = formProps?.label ? `${formProps.label} (${fullName})` : fullName;

  return (
    <Space>
      {title && (
        <p style={{ margin: 'unset' }}>
          {title}
        </p>
      )}
      <HelpTextPopover content={formProps.description}></HelpTextPopover>
    </Space>
  );
};
