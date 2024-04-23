import React from 'react';
import { resetServerContext } from 'react-beautiful-dnd';
import { FormDesigner } from '@/components';
import { PageWithLayout } from '@/interfaces';
import { FormIdentifier } from '@/providers/form/models';
import { DataContextProvider } from '@/providers/dataContextProvider';

export interface IFormsDesignerPagePageProps {
  formId: FormIdentifier;
}

export const FormsDesignerPage: PageWithLayout<IFormsDesignerPagePageProps> = (props) => {
  return (
    /* formContext has added only to customize the designed form. It is not used as a data context.*/
    <DataContextProvider id={'formContext'} name={'formContext'} type={'form'}>
      <FormDesigner formId={props.formId} />
    </DataContextProvider>
  );
};

FormsDesignerPage['getInitialProps'] = async () => {
  resetServerContext(); // required for Drag&Drop

  return {};
};