import { ConfigurableForm } from '@/components';
import { FormFullName } from '@/interfaces';
import { useShaFormInstance } from '@/providers';
import React, { FC, useMemo } from 'react';

export interface IConfigurableEditorProps {
  itemId: string;
  formId: FormFullName;
}

export const ConfigurableEditor: FC<IConfigurableEditorProps> = (props) => {
  const { formId, itemId } = props;

  const formArguments = useMemo(() => {
    return { id: itemId };
  }, [itemId]);

  const shaForm = useShaFormInstance();
  return (
    <ConfigurableForm
      formName="cs-editor"
      formId={formId}
      externalShaForm={shaForm}
      form={shaForm.antdForm} // TODO: review V1 split ConfigurableForm into two parts and remove this property
      mode="edit"
      formArguments={formArguments}
      isActionsOwner={true}
      logEnabled={false}
    />
  );
};
