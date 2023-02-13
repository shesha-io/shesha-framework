import { usePersonGet, usePersonUpdate } from 'api/person';
import { GenericEditPage } from '@shesha/reactjs';
import { NextPage } from 'next';
interface IProps {
  id?: string;
}

const EditPage: NextPage<IProps> = props => {
  return <GenericEditPage title={() => 'User Edit'} id={props.id} fetcher={usePersonGet} updater={usePersonUpdate} />;
};

export default EditPage;
