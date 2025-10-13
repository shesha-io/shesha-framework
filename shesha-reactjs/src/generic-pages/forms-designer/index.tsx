import React from 'react';
import { resetServerContext } from 'react-beautiful-dnd';
import { FormDesigner } from '@/components';
import { PageWithLayout } from '@/interfaces';
import { FormIdentifier } from '@/providers/form/models';

export interface IFormsDesignerPagePageProps {
  formId: FormIdentifier;
}

export const FormsDesignerPage: PageWithLayout<IFormsDesignerPagePageProps> = (props) => {
  return (
    <FormDesigner formId={props.formId} />
  );
};

FormsDesignerPage['getInitialProps'] = () => {
  resetServerContext(); // required for Drag&Drop

  return Promise.resolve({});
};
