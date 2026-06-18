import FormInfo from '../configurableForm/formInfo';
import ParentProvider from '@/providers/parentProvider/index';
import React, { FC, ReactNode, useState } from 'react';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { DataListCrudProvider, DataProcessor, useDataListCrud } from '@/providers/dataListCrudContext/index';
import { FormMarkupConverter } from '@/providers/formMarkupConverter/index';
import { FormRawMarkup, IFormSettings, IPersistedFormProps } from '@/interfaces';
import { NewItemInitializer } from './models';
import { ItemContainerForm } from './itemContainerForm';
import { Modal, Skeleton } from 'antd';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import ValidationErrors from '../validationErrors';
import { isDefined } from '@/utils/nullables';

interface ICreateModalProps {
  formInfo?: IPersistedFormProps | undefined;
  readOnly?: boolean | undefined;
  loading: boolean | undefined;
  onToggle: (isOpen: boolean) => void;
  width?: string | undefined;
}

const CreateModal: FC<ICreateModalProps> = ({
  formInfo,
  readOnly,
  loading = false,
  onToggle,
  width,
}) => {
  const { performCreate, switchMode, saveError } = useDataListCrud();
  const [isloading, setLoading] = useState(loading);

  const { buttonLoading, buttonDisabled } = {
    buttonLoading: isloading,
    buttonDisabled: readOnly || isloading,
  };


  const onOk = async (): Promise<void> => {
    try {
      setLoading(true);
      await performCreate();
      switchMode('read');
      onToggle(false);
    } catch (error) {
      setLoading(false);
      console.error('Update failed: ', error);
    }
  };

  const onCancel = (): void => {
    onToggle(false);
  };

  return (
    <Modal
      open={true}
      onOk={onOk}
      onCancel={onCancel}
      title="Add new item"
      {...(width ? { width } : {})}
      okButtonProps={{ disabled: buttonDisabled, loading: buttonLoading }}
    >
      <FormInfo formProps={formInfo ?? {}} visible={isDefined(formInfo)}>
        <Skeleton loading={loading}>
          <ValidationErrors error={saveError} />
          <ParentProvider model={null} formMode="edit">
            <ComponentsContainerProvider ContainerComponent={ItemContainerForm}>
              <ComponentsContainer containerId="root" />
            </ComponentsContainerProvider>
          </ParentProvider>
        </Skeleton>
      </FormInfo>
    </Modal>
  );
};

export interface IDataListItemCreateModalProps<TValue extends object = object> {
  formInfo?: IPersistedFormProps | undefined;
  creater?: DataProcessor<TValue> | undefined;
  data: TValue | NewItemInitializer<TValue> | undefined;
  markup: FormRawMarkup;
  formSettings: IFormSettings;
  onToggle: (isOpen: boolean) => void;
  width?: string | undefined;
}

const DataListItemCreateModal = <TValue extends object = object>(props: IDataListItemCreateModalProps<TValue>): ReactNode => {
  const {
    formInfo,
    data,
    markup,
    formSettings,
    creater,
    onToggle,
    width,
  } = props;

  return (
    <FormMarkupConverter markup={markup} formSettings={formSettings}>
      {(flatComponents) => (
        <DataListCrudProvider<TValue>
          isNewObject={true}
          data={data}
          allowEdit={true}
          creater={creater}
          allowDelete={false}
          mode="create"
          allowChangeMode={false}
          autoSave={false}
          formFlatMarkup={flatComponents}
          formSettings={formSettings}
        >
          <CreateModal
            formInfo={formInfo}
            loading={false}
            onToggle={onToggle}
            width={width}
          />
        </DataListCrudProvider>
      )}
    </FormMarkupConverter>
  );
};

export default DataListItemCreateModal;
