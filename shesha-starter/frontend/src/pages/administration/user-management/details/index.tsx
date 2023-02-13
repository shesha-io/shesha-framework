import { EditOutlined } from '@ant-design/icons';
import { usePersonGet } from 'api/person';
import { GenericDetailsPage } from '@shesha/reactjs';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { URL_ADMINISTRATION_USER_MANAGEMENT_PAGE } from 'routes';

interface IProps {
  id?: string;
}

const DetailsPage: NextPage<IProps> = props => {
  const router = useRouter();

  return (
    <GenericDetailsPage
      title="User Details"
      id={props.id}
      fetcher={usePersonGet}
      toolbarItems={[
        {
          title: 'Edit',
          icon: <EditOutlined />,
          onClick: () => router.push(`${URL_ADMINISTRATION_USER_MANAGEMENT_PAGE}/edit?id=${props.id}`),
        },
      ]}
    />
  );
};

export default DetailsPage;
