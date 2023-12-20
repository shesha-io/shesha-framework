import { ComponentsContainer, FormRawMarkup, IFormSettings, IPersistedFormProps, Show, ValidationErrors } from '@/index';
import { DataListCrudProvider, useDataListCrud } from '@/providers/dataListCrudContext/index';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { FormMarkupConverter } from '@/providers/formMarkupConverter/index';
import { Modal, Skeleton } from 'antd';
import React, { FC } from 'react';
import FormInfo from '../configurableForm/formInfo';

import { ItemContainerForm } from './itemContainerForm';
import { IDataListProps, NewItemInitializer } from './models';

export interface IDataListItemCreateModalProps {
  formInfo?: IPersistedFormProps;
  creater?: (data: any) => Promise<any>;
  data?: object | NewItemInitializer;
  markup: FormRawMarkup;
  formSettings: IFormSettings;
  onToggle: (isOpen: boolean) => void;
}

const DataListItemCreateModal: FC<IDataListItemCreateModalProps> = (props) => {
  const {
    data,
    markup,
    formSettings,
    creater,
    onToggle
  } = props;

  return (
    <FormMarkupConverter markup={markup} formSettings={formSettings}>
      {(flatComponents) => (
        <DataListCrudProvider
          isNewObject={true}
          data={data}
          allowEdit={true}
          creater={creater}
          allowDelete={false}
          mode='create'
          allowChangeMode={false}
          autoSave={false}
          editorComponents={flatComponents}
          displayComponents={flatComponents}
          formSettings={formSettings}
        >
          <CreateModal
            formInfo={props.formInfo}
            loading={false} 
            onToggle={onToggle} 
           />
        </DataListCrudProvider>
      )}
    </FormMarkupConverter>
  );
};

interface ICreateModalProps extends IDataListProps {
  formInfo?: IPersistedFormProps;
  readOnly?: boolean;
  loading: boolean;
  onToggle: (isOpen: boolean) => void;
}

const CreateModal: FC<ICreateModalProps> = ({
  formInfo,
  readOnly,
  loading = false,
  //modalTitle: title,
  //modalWidth: width = '60%',
  onToggle
}) => {

  const {performCreate, switchMode, saveError} = useDataListCrud();

  const onOk = async () => {
    try {
      await performCreate();
      switchMode('read');
      onToggle(false);
    } catch (error) {
      console.log('Update failed: ', error);
    }

  };

  const onCancel = () => {
    onToggle(false);
  };

  return (
    <Modal
      open={true}
      onOk={onOk}
      onCancel={onCancel}
      title='Add new item'
      //width={width}
      okButtonProps={{ disabled: readOnly }}
    >
      <Skeleton loading={loading}>
        <Show when={!!formInfo}>
          <FormInfo {...formInfo} />
        </Show>

        <ValidationErrors error={saveError} />
        <ComponentsContainerProvider ContainerComponent={ItemContainerForm}>
          <ComponentsContainer containerId={'root'}/>
        </ComponentsContainerProvider>
      </Skeleton>
    </Modal>
  );
};



export default DataListItemCreateModal;
