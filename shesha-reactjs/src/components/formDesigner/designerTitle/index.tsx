import HelpTextPopover from '@/components/helpTextPopover';
import React, { FC } from 'react';
import { getFormFullName } from '@/utils/form';
import { Space } from 'antd';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export const DesignerTitle: FC = ({ }) => {
  const { formProps } = useFormPersister();
  const fullName = formProps && !isNullOrWhiteSpace(formProps.name)
    ? getFormFullName(formProps.module ?? null, formProps.name)
    : null;
  const title = formProps?.label ? `${formProps.label} (${fullName})` : fullName;

  return (
    <Space>
      {title && (
        <p style={{ margin: 'unset' }}>
          {title}
        </p>
      )}
      {isDefined(formProps) && <HelpTextPopover content={formProps.description}></HelpTextPopover>}
    </Space>
  );
};
