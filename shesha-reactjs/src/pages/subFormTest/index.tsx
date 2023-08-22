import { Button, Form } from 'antd';
import React, { useState } from 'react';
import { FormProvider, Page, PageWithLayout, SubFormProvider } from '../..';
import SubForm from '../../components/formDesigner/components/subForm/subForm';

export interface ISubFormTestPageProps {}

const SubFormTestPage: PageWithLayout<ISubFormTestPageProps> = () => {
  const [formName, setFormName] = useState('/organisations/edit');

  return (
    <Page title="SubForm Test" description="">
      <FormProvider
        mode={'edit'}
        allComponents={{}}
        componentRelations={{}}
        formSettings={{ colon: true, labelCol: {}, wrapperCol: {}, layout: 'vertical' }}
        name={''}
        isActionsOwner={false}
      >
        <Form.Item>
          <Button
            onClick={() => {
              setFormName('/organisations/edit');
            }}
          >
            Organisaiont
          </Button>
          <Button
            onClick={() => {
              setFormName('person-edit');
            }}
          >
            Person
          </Button>
        </Form.Item>
        <Form.Item>
          <SubFormProvider
            name={'subformtest'}
            //markup={{ components: formConfiguration?.markup, formSettings: formConfiguration?.settings }}
            properties={[]}
            formId={{ name: formName, version: 1 }}
            dataSource={'api'}
            //labelCol={localLabelCol}
            //wrapperCol={localWrapperCol}
          >
            <SubForm />
          </SubFormProvider>
        </Form.Item>
      </FormProvider>
    </Page>
  );
};

export default SubFormTestPage;
