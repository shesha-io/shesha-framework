import React, { FC, useEffect } from 'react';
import { Form, Spin, Checkbox } from 'antd';
import { IndexToolbar, IToolbarItem, MainLayout, ValidationErrors, useAuth } from '@shesha/reactjs';
import { useRouter } from 'next/router';
import { EditOutlined } from '@ant-design/icons';
import { CollapsiblePanel } from '@shesha/reactjs';
import { MobileDeviceDto, useMobileDeviceGet } from 'api/mobileDevice';
import { NextPage } from 'next';

interface IProps {
  id?: string;
}

interface IDetailsViewProps {
  model: MobileDeviceDto;
}

const DetailsView: FC<IDetailsViewProps> = ({ model }) => {
  const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
  };

  return (
    <CollapsiblePanel header="Team Details">
      <Form className="table-form" layout="horizontal" {...formItemLayout}>
        <Form.Item label="Name:">{model.name}</Form.Item>
        <Form.Item label="IMEI:">{model.imei}</Form.Item>
        <Form.Item label="Is Locked:">
          <Checkbox checked={model.isLocked} disabled={true}></Checkbox>
        </Form.Item>
      </Form>
    </CollapsiblePanel>
  );
};

const DetailsPage: NextPage<IProps> = (props) => {
  const { headers } = useAuth();

  const {
    loading: loading,
    refetch: doFetch,
    error: fetchError,
    data: serverData,
  } = useMobileDeviceGet({
    lazy: true,
    requestOptions: { headers },
  });

  const fetchData = async () => {
    await doFetch({ queryParams: { id: props.id } });
  };

  // fetch data on page load
  useEffect(() => {
    fetchData();
  }, []);

  const router = useRouter();

  const toolbarItems: IToolbarItem[] = [
    {
      title: 'Edit',
      icon: <EditOutlined />,
      onClick: () => router.push(`/settings/mobileDevices/edit?id=${props.id}`),
    },
  ];

  const model = serverData?.result;

  return (
    <Spin spinning={loading} tip="Loading...">
      <MainLayout
        title="Mobile Device Details"
        description=""
        showHeading={false}
        toolbar={<IndexToolbar items={toolbarItems} />}
      >
        <ValidationErrors error={fetchError} />
        {model && <DetailsView model={model}></DetailsView>}
      </MainLayout>
    </Spin>
  );
};

export default DetailsPage;
