import React, { FC, useEffect } from 'react';
import { Form, Spin } from 'antd';
import { NextPage } from 'next';
import { useOtpAuditItemGet, OtpAuditItemDto } from 'api/otpAuditItem';
import moment from 'moment';
import { CollapsiblePanel, DisplayFormItem, MainLayout, ValidationErrors } from '@shesha/reactjs';

interface IProps {
  id?: string;
}

interface IDetailsViewProps {
  model: OtpAuditItemDto;
}

const DetailsView: FC<IDetailsViewProps> = ({ model }) => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  return (
    <CollapsiblePanel header="One-Time-Pin Details">
      <Form className="table-form" layout="horizontal" {...formItemLayout}>
        <DisplayFormItem label="Created On:">
          {model.creationTime ? moment(model.creationTime).format('DD/MM/YYYY HH:mm:ss') : null}
        </DisplayFormItem>

        <DisplayFormItem label="Sent to:">{model.sendTo}</DisplayFormItem>

        <DisplayFormItem label="Send type:">{model.sendType?.item}</DisplayFormItem>

        <DisplayFormItem label="Recipient type:">{model.recipientType}</DisplayFormItem>

        <DisplayFormItem label="Recipient Id:">{model.recipientId}</DisplayFormItem>

        <DisplayFormItem label="Expires On:">
          {model.expiresOn ? moment(model.expiresOn).format('DD/MM/YYYY HH:mm:ss') : null}
        </DisplayFormItem>

        <DisplayFormItem label="OTP:">{model.otp}</DisplayFormItem>

        <DisplayFormItem label="Action Type:">{model.actionType}</DisplayFormItem>
        <DisplayFormItem label="Sent On:">
          {model.sentOn ? moment(model.sentOn).format('DD/MM/YYYY HH:mm:ss') : null}
        </DisplayFormItem>
        <DisplayFormItem label="Send status:">{model.sendStatus?.item}</DisplayFormItem>
        <DisplayFormItem label="Error message:">{model.errorMessage}</DisplayFormItem>
      </Form>
    </CollapsiblePanel>
  );
};

const DetailsPage: NextPage<IProps> = (props) => {
  const {
    loading: loading,
    refetch: doFetch,
    error: fetchError,
    data: serverData,
  } = useOtpAuditItemGet({
    lazy: true,
  });

  const fetchData = async () => {
    await doFetch({ queryParams: { id: props.id } });
  };

  // fetch data on page load
  useEffect(() => {
    fetchData();
  }, []);

  const model = serverData?.result;

  return (
    <Spin spinning={loading} tip="Loading...">
      <MainLayout title={'One-Time-Pin Details'} description="">
        <ValidationErrors error={fetchError} />
        {model && <DetailsView model={model}></DetailsView>}
      </MainLayout>
    </Spin>
  );
};

export default DetailsPage;
