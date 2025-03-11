import React, { FC, useMemo } from 'react';
import { Result } from 'antd';
import { useCrud } from "@/providers/crudContext/index";
import { IConfigurableCellProps, IFormCellProps } from '../interfaces';
import { ComponentsContainer, ConfigurableItemFullName, FormIdentifier, FormItemProvider, ROOT_COMPONENT_KEY, useAppConfigurator } from '@/index';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import ParentProvider from '@/providers/parentProvider/index';
import { ITableFormColumn } from '@/providers/dataTable/interfaces';
import { LoadingOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { ComponentsContainerFormCell } from './componentsContainerFormCell';
import { useFormById } from '@/providers/formManager/hooks';
import { UpToDateForm } from '@/providers/formManager/interfaces';
import { getFormForbiddenMessage, getFormNotFoundMessage } from '@/providers/configurationItemsLoader/utils';
import AttributeDecorator from '@/components/attributeDecorator';

const MODE_READONLY_TRUE = { readOnly: true };
const MODE_READONLY_FALSE = { readOnly: false };

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
    : formLoading.state === 'error'
      ? formLoading.error?.code === 404
        ? <Result status="404" title="404" subTitle={getFormNotFoundMessage(formId)} />
        : formLoading.error?.code === 401 || formLoading.error?.code === 403
          ? <Result status="403" title="403" subTitle={getFormForbiddenMessage(formId)} />
          : <>Form loading error</>
      : children(formLoading.form);
};

const ReadFormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-form-name': `${(props.columnConfig.displayFormId as ConfigurableItemFullName)?.module}/${(props.columnConfig.displayFormId as ConfigurableItemFullName)?.name}`,
    'data-sha-parent-form-id': `${props.parentFormId}`,
    'data-sha-parent-form-name': `${props.parentFormName}`,
  };

  return !props.columnConfig.displayFormId
    ? null
    : (
      <FormCellRender formId={props.columnConfig.displayFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div className={styles.shaFormCell} style={styleMinHeight}>
              <FormItemProvider labelCol={form.settings?.labelCol}>
                <ParentProvider model={MODE_READONLY_TRUE} formMode='readonly' formFlatMarkup={form.flatStructure} isScope>
                  <ComponentsContainerProvider ContainerComponent={ComponentsContainerFormCell}>
                    <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
                  </ComponentsContainerProvider>
                </ParentProvider>
              </FormItemProvider>
            </div>
          </AttributeDecorator>
        )}
      </FormCellRender>
    );
};

export const CreateFormCell = (props: IConfigurableCellProps<ITableFormColumn>) => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-form-name': `${(props.columnConfig.createFormId as ConfigurableItemFullName)?.module}/${(props.columnConfig.createFormId as ConfigurableItemFullName)?.name}`,
    'data-sha-parent-form-id': `${(props as any)?.parentFormId}`,
    'data-sha-parent-form-name': `${(props as any)?.parentFormName}`,
  };

  return !props.columnConfig.createFormId
    ? null
    : (
      <FormCellRender formId={props.columnConfig.createFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div className={styles.shaFormCell} style={styleMinHeight} data-sha-form-name={`${(props.columnConfig.createFormId as ConfigurableItemFullName)?.module}/${(props.columnConfig.createFormId as ConfigurableItemFullName)?.name}`}>
              <FormItemProvider labelCol={form.settings?.labelCol}>
                <ParentProvider model={MODE_READONLY_FALSE} formMode='edit' formFlatMarkup={form.flatStructure} isScope>
                  <ComponentsContainerProvider ContainerComponent={ComponentsContainerFormCell}>
                    <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
                  </ComponentsContainerProvider>
                </ParentProvider>
              </FormItemProvider>
            </div>
          </AttributeDecorator>
        )}
      </FormCellRender>
    );
};

const EditFormCell = <D extends object = {}, V = number>(props: IFormCellProps<D, V>) => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-form-name': `${(props.columnConfig.editFormId as ConfigurableItemFullName)?.module}/${(props.columnConfig.editFormId as ConfigurableItemFullName)?.name}`,
    'data-sha-parent-form-id': `${props.parentFormId}`,
    'data-sha-parent-form-name': `${props.parentFormName}`,
  };

  return !props.columnConfig.editFormId
    ? <ReadFormCell {...props} />
    : (
      <FormCellRender formId={props.columnConfig.editFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div className={styles.shaFormCell} style={styleMinHeight}>
              <FormItemProvider labelCol={form.settings?.labelCol}>
                <ParentProvider model={MODE_READONLY_FALSE} formMode='edit' formFlatMarkup={form.flatStructure} isScope>
                  <ComponentsContainerProvider ContainerComponent={ComponentsContainerFormCell}>
                    <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
                  </ComponentsContainerProvider>
                </ParentProvider>
              </FormItemProvider>
            </div>
          </AttributeDecorator>
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