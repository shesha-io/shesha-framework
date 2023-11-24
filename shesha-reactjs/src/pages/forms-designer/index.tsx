import React from 'react';
import { resetServerContext } from 'react-beautiful-dnd';
import { FormDesigner } from '../../components';
import { PageWithLayout } from '../../interfaces';
import { FormIdentifier } from '@/providers/form/models';

export interface IDesignerPageProps {
  formId: FormIdentifier;
}

const DesignerPage: PageWithLayout<IDesignerPageProps> = (props) => {
  return <FormDesigner formId={props.formId} />;
};

DesignerPage['getInitialProps'] = async () => {
  resetServerContext(); // required for Drag&Drop

  return {};
};

export default DesignerPage;
