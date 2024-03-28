import React, { useMemo, useState } from 'react';
import { useCrud } from "@/providers/crudContext/index";
import { IConfigurableCellProps, IFormCellProps } from '../interfaces';
import { ComponentsContainer, FormItemProvider, IFlatComponentsStructure, IFormDto, ROOT_COMPONENT_KEY, componentsTreeToFlatStructure, useAppConfigurator, useConfigurationItemsLoader } from '@/index';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { ComponentsContainerForm } from '@/components/formDesigner/containers/componentsContainerForm';
import ParentProvider from '@/providers/parentProvider/index';
import { ITableFormColumn } from '@/providers/dataTable/interfaces';
import { LoadingOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { ComponentsContainerFormCell } from './componentsContainerFormCell';

const ReadFormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { configurationItemMode } = useAppConfigurator();
  const [form, setForm] = useState<IFormDto>();
  const { getForm } = useConfigurationItemsLoader();
  const { styles } = useStyles();
  const toolboxComponents = useFormDesignerComponents();

  const flatComponentsStructure: IFlatComponentsStructure = useMemo(() => {
    return !!form?.markup
      ? componentsTreeToFlatStructure(toolboxComponents, form.markup)
      : {allComponents: {}, componentRelations: {}};
  }, [form, toolboxComponents]);

  if (!props.columnConfig.displayFormId) 
    return <></>;

  getForm({formId: props.columnConfig.displayFormId, skipCache: false, configurationItemMode})
    .then((form) => {
      setForm(form);
    });

  return !form
    ? <LoadingOutlined />
    : (
      <div className={styles.shaFormCell}> 
        <FormItemProvider labelCol={form.settings?.labelCol}>
          <ParentProvider model={{ readOnly: true }} formMode='readonly' flatComponentsStructure={flatComponentsStructure}>
            <ComponentsContainerProvider ContainerComponent={ComponentsContainerFormCell}>
              <ComponentsContainer containerId={ROOT_COMPONENT_KEY} dynamicComponents={form.markup} />
            </ComponentsContainerProvider>
          </ParentProvider>
        </FormItemProvider>
      </div>
    );
};

export const CreateFormCell = (props: IConfigurableCellProps<ITableFormColumn>) => {
  const { configurationItemMode } = useAppConfigurator();
  const [form, setForm] = useState<IFormDto>();
  const { getForm } = useConfigurationItemsLoader();
  const { styles } = useStyles();
  
  if (!props.columnConfig.createFormId) 
    return <></>;

  getForm({formId: props.columnConfig.createFormId, skipCache: false, configurationItemMode})
    .then((form) => {
      setForm(form);
    });

  return !form
    ? <LoadingOutlined />
    : (
      <div className={styles.shaFormCell}> 
        <FormItemProvider labelCol={form.settings?.labelCol}>
          <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
            <ComponentsContainer containerId={ROOT_COMPONENT_KEY} dynamicComponents={form.markup} />
          </ComponentsContainerProvider>
        </FormItemProvider>
      </div>
    );
};

const EditFormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { configurationItemMode } = useAppConfigurator();
  const [form, setForm] = useState<IFormDto>();
  const { getForm } = useConfigurationItemsLoader();
  const { styles } = useStyles();

  if (!props.columnConfig.editFormId) 
    return <ReadFormCell {...props}/>;

  getForm({formId: props.columnConfig.editFormId, skipCache: false, configurationItemMode})
    .then((form) => {
      setForm(form);
    });

  return !form
    ? <LoadingOutlined />
    : (
      <div className={styles.shaFormCell}> 
        <FormItemProvider labelCol={form.settings?.labelCol}>
          <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
            <ComponentsContainer containerId={ROOT_COMPONENT_KEY} dynamicComponents={form.markup} />
          </ComponentsContainerProvider>
        </FormItemProvider>
      </div>
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