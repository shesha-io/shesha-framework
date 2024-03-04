import React, { useState } from 'react';
import { useCrud } from "@/providers/crudContext/index";
import { IConfigurableCellProps, IFormCellProps } from './interfaces';
import { ComponentsContainer, FormRawMarkup, ROOT_COMPONENT_KEY, useAppConfigurator, useConfigurationItemsLoader } from '@/index';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { ComponentsContainerForm } from '@/components/formDesigner/containers/componentsContainerForm';
import ParentProvider from '@/providers/parentProvider/index';
import { ITableFormColumn } from '@/providers/dataTable/interfaces';
import { LoadingOutlined } from '@ant-design/icons';

const ReadFormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { configurationItemMode } = useAppConfigurator();
  const [markup, setmarkup] = useState<FormRawMarkup>();
  const { getForm } = useConfigurationItemsLoader();

  if (!props.columnConfig.displayFormId) 
    return <></>;

  getForm({formId: props.columnConfig.displayFormId, skipCache: false, configurationItemMode})
    .then((form) => {
      setmarkup(form.markup);
    });

  return !markup
    ? <LoadingOutlined />
    : (
      <div style={{width: '100%'}}> 
        <ParentProvider model={{ readOnly: true }} formMode='readonly'>
          <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
            <ComponentsContainer containerId={ROOT_COMPONENT_KEY} dynamicComponents={markup} />
          </ComponentsContainerProvider>
        </ParentProvider>
      </div>
    );
};

export const CreateFormCell = (props: IConfigurableCellProps<ITableFormColumn>) => {
  const { configurationItemMode } = useAppConfigurator();
  const [markup, setmarkup] = useState<FormRawMarkup>();
  const { getForm } = useConfigurationItemsLoader();
  
  if (!props.columnConfig.createFormId) 
    return <></>;

  getForm({formId: props.columnConfig.createFormId, skipCache: false, configurationItemMode})
    .then((form) => {
      setmarkup(form.markup);
    });

  return !markup
    ? <LoadingOutlined />
    : (
      <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
        <ComponentsContainer containerId={ROOT_COMPONENT_KEY} dynamicComponents={markup} />
      </ComponentsContainerProvider>
    );
};

const EditFormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { configurationItemMode } = useAppConfigurator();
  const [markup, setmarkup] = useState<FormRawMarkup>();
  const { getForm } = useConfigurationItemsLoader();
  
  if (!props.columnConfig.editFormId) 
    return <ReadFormCell {...props}/>;

  getForm({formId: props.columnConfig.editFormId, skipCache: false, configurationItemMode})
    .then((form) => {
      setmarkup(form.markup);
    });

  return !markup
    ? <LoadingOutlined />
    : (
      <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
        <ComponentsContainer containerId={ROOT_COMPONENT_KEY} dynamicComponents={markup} />
      </ComponentsContainerProvider>
    );
};

export const FormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { mode } = useCrud();

  switch (mode) {
    case 'create':
      return <CreateFormCell {...props} />;
    case 'read':
      return <ReadFormCell {...props} />;
    case 'update':
      return <EditFormCell {...props} />;
    default:
      return null;
  }
};

export default FormCell;