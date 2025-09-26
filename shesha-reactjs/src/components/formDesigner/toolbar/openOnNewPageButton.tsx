import React, { FC } from 'react';
import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useFormDesignerUrl } from '@/providers/form/hooks';
import { useFormPersister } from '@/providers/formPersisterProvider';

export interface IOpenOnNewPageButtonProps {

}

export const OpenOnNewPageButton: FC<IOpenOnNewPageButtonProps> = () => {
  const { formId } = useFormPersister();
  const formDesignerUrl = useFormDesignerUrl(formId);
  return (
        <Button icon={<ArrowsAltOutlined />} onClick={() => window?.open(formDesignerUrl, '_blank')} type="default" shape="circle" title="Expand" />
  );
};
