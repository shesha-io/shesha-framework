import { ConfigurableForm } from '@/components';
import { FormFullName } from '@/interfaces';
import { useShaFormInstance } from '@/providers';
import React, { FC } from 'react';

export interface IConfigurabeleEditorProps {
  itemId: string;
  formId: FormFullName;
}

export const ConfigurabeleEditor: FC<IConfigurabeleEditorProps> = (props) => {
  const { formId, itemId } = props;
  const shaForm = useShaFormInstance();
  return (
    <ConfigurableForm
      formName="cs-editor"
      formId={formId}
      externalShaForm={shaForm}
      form={shaForm.antdForm} // TODO: review V1 split ConfigurableForm into two peaces and remove this property
      mode="edit"
      formArguments={{ id: itemId }}
      isActionsOwner={true}
    />
  );
};
