import React, { FC } from 'react';
import { useCrud } from "@/providers/crudContext/index";
import { IConfigurableCellProps, IFormCellProps } from '../interfaces';
import { ComponentsContainer, FormIdentifier, FormItemProvider, ROOT_COMPONENT_KEY, useAppConfigurator } from '@/index';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import ParentProvider from '@/providers/parentProvider/index';
import { ITableFormColumn } from '@/providers/dataTable/interfaces';
import { LoadingOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { ComponentsContainerFormCell } from './componentsContainerFormCell';
import { useFormById } from '@/providers/formManager/hooks';
import { UpToDateForm } from '@/providers/formManager/interfaces';

interface FormCellRenderProps {
  formId: FormIdentifier;
  children: (form: UpToDateForm) => React.ReactElement;
}

const FormCellRender: FC<FormCellRenderProps> = ({ formId, children }) => {
  if (!formId)
    throw new Error('FormId is required');

  const { configurationItemMode } = useAppConfigurator();
  const formLoading = useFormById({ formId: formId, skipCache: false, configurationItemMode });

  return formLoading.state === 'loading'
    ? <LoadingOutlined />
    : children(formLoading.form);
};

const ReadFormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { styles } = useStyles();

  return !props.columnConfig.displayFormId
    ? null
    : (
      <FormCellRender formId={props.columnConfig.displayFormId}>
        {(form) => (
          <div className={styles.shaFormCell} style={{ minHeight: props.columnConfig.minHeight ?? 0 }}>
            <FormItemProvider labelCol={form.settings?.labelCol}>
              <ParentProvider model={{ readOnly: true }} formMode='readonly' formFlatMarkup={form.flatStructure}>
                <ComponentsContainerProvider ContainerComponent={ComponentsContainerFormCell}>
                  <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
                </ComponentsContainerProvider>
              </ParentProvider>
            </FormItemProvider>
          </div>
        )}
      </FormCellRender>
    );
};

export const CreateFormCell = (props: IConfigurableCellProps<ITableFormColumn>) => {
  const { styles } = useStyles();

  return !props.columnConfig.createFormId
    ? null
    : (
      <FormCellRender formId={props.columnConfig.createFormId}>
        {(form) => (
          <div className={styles.shaFormCell} style={{ minHeight: props.columnConfig.minHeight ?? 0 }}>
            <FormItemProvider labelCol={form.settings?.labelCol}>
              <ParentProvider model={{ readOnly: false }} formMode='edit' formFlatMarkup={form.flatStructure}>
                <ComponentsContainerProvider ContainerComponent={ComponentsContainerFormCell}>
                  <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
                </ComponentsContainerProvider>
              </ParentProvider>
            </FormItemProvider>
          </div>
        )}
      </FormCellRender>
    );
};

const EditFormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { styles } = useStyles();

  return !props.columnConfig.editFormId
    ? <ReadFormCell {...props} />
    : (
      <FormCellRender formId={props.columnConfig.editFormId}>
        {(form) => (
          <div className={styles.shaFormCell} style={{ minHeight: props.columnConfig.minHeight ?? 0 }}>
            <FormItemProvider labelCol={form.settings?.labelCol}>
              <ParentProvider model={{ readOnly: false }} formMode='edit' formFlatMarkup={form.flatStructure}>
                <ComponentsContainerProvider ContainerComponent={ComponentsContainerFormCell}>
                  <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
                </ComponentsContainerProvider>
              </ParentProvider>
            </FormItemProvider>
          </div>
        )}
      </FormCellRender>
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