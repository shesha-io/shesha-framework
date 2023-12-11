import { ComponentsContainer, FormRawMarkup, IFormSettings, Show, useAppConfigurator, ValidationErrors } from '@/index';
import { CrudProvider, useCrud } from '@/providers/crudContext/index';
import { IFormMarkupResponse } from '@/providers/form/api';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { FormMarkupConverter } from '@/providers/formMarkupConverter/index';
import { ConfigurationItemVersionStatusMap } from '@/utils/configurationFramework/models';
import { Modal, Skeleton } from 'antd';
import React, { FC } from 'react';
import FormInfo from '../configurableForm/formInfo';

import { ItemContainerForm } from './itemContainerForm';
import { IDataListProps, NewItemInitializer } from './models';

export interface IDataListItemCreateModalProps {
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
        <CrudProvider
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
            loading={false} 
            onToggle={onToggle} 
           />
        </CrudProvider>
      )}
    </FormMarkupConverter>
  );
};

interface ICreateModalProps extends IDataListProps {
  formInfo?: IFormMarkupResponse['formConfiguration'];
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

  const {performCreate, switchMode, saveError} = useCrud();

  const { formInfoBlockVisible } = useAppConfigurator();

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

  const showFormInfo = !!formInfo && formInfoBlockVisible && !!ConfigurationItemVersionStatusMap?.[formInfo?.versionStatus];

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
        <Show when={showFormInfo}>
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
