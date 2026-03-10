import React, { FC, useMemo } from 'react';
import { Result } from 'antd';
import { useCrud } from "@/providers/crudContext/index";
import { IConfigurableCellProps, IFormCellProps } from '../interfaces';
import { ComponentsContainer, ConfigurableItemFullName, FormIdentifier, FormItemProvider, isFormFullName, ROOT_COMPONENT_KEY } from '@/index';
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
import axios from 'axios';

const MODE_READONLY_TRUE = { readOnly: true };
const MODE_READONLY_FALSE = { readOnly: false };

interface FormCellRenderProps {
  formId: FormIdentifier;
  children: (form: UpToDateForm) => React.ReactElement;
}

const getFormLoadingErorr = (formId: FormIdentifier, error: unknown): React.ReactElement => {
  if (axios.isAxiosError(error)) {
    switch (error.status) {
      case 404: return <Result status="404" title="404" subTitle={getFormNotFoundMessage(formId)} />;
      case 401:
      case 403: return <Result status="403" title="403" subTitle={getFormForbiddenMessage(formId)} />;
    }
  }
  return <>Form loading error</>;
};


const FormCellRender: FC<FormCellRenderProps> = ({ formId, children }) => {
  if (!formId)
    throw new Error('FormId is required');

  const formLoading = useFormById({ formId: formId, skipCache: false });

  return formLoading.state === 'loading'
    ? <LoadingOutlined />
    : formLoading.state === 'error'
      ? getFormLoadingErorr(formId, formLoading.error)
      : children(formLoading.form);
};

const ReadFormCell = <D extends object = object, V = number>(props: IFormCellProps<D, V>): JSX.Element => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-parent-form-id': `${props.parentFormId}`,
    'data-sha-parent-form-name': `${props.parentFormName}`,
  };

  if (isFormFullName(props.columnConfig.displayFormId))
    attributes['data-sha-form-name'] = `${props.columnConfig.displayFormId.module}/${props.columnConfig.displayFormId.name}`;
  else if (typeof props.columnConfig.displayFormId === 'string' && props.columnConfig.displayFormId)
    attributes['data-sha-form-id'] = props.columnConfig.displayFormId;

  return !props.columnConfig.displayFormId
    ? null
    : (
      <FormCellRender formId={props.columnConfig.displayFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div className={styles.shaFormCell} style={styleMinHeight}>
              <FormItemProvider labelCol={form.settings?.labelCol}>
                <ParentProvider model={MODE_READONLY_TRUE} formMode="readonly" formFlatMarkup={form.flatStructure} isScope>
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

export interface ICreateFormCellProps extends IConfigurableCellProps<ITableFormColumn> {
  /** FormId GUID */
  parentFormId?: string;
  /** `Module`/`FormName` */
  parentFormName?: string;
}

export const CreateFormCell = (props: ICreateFormCellProps): JSX.Element => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-parent-form-name': `${props.parentFormName}`,
  };

  if (props.parentFormId)
    attributes['data-sha-parent-form-id'] = props.parentFormId;

  if (isFormFullName(props.columnConfig.createFormId))
    attributes['data-sha-form-name'] = `${props.columnConfig.createFormId.module}/${props.columnConfig.createFormId.name}`;
  else if (typeof props.columnConfig.createFormId === 'string' && props.columnConfig.createFormId)
    attributes['data-sha-form-id'] = props.columnConfig.createFormId;

  return !props.columnConfig.createFormId
    ? null
    : (
      <FormCellRender formId={props.columnConfig.createFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div className={styles.shaFormCell} style={styleMinHeight} data-sha-form-name={`${(props.columnConfig.createFormId as ConfigurableItemFullName)?.module}/${(props.columnConfig.createFormId as ConfigurableItemFullName)?.name}`}>
              <FormItemProvider labelCol={form.settings?.labelCol}>
                <ParentProvider model={MODE_READONLY_FALSE} formMode="edit" formFlatMarkup={form.flatStructure} isScope>
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

const EditFormCell = <D extends object = object, V = number>(props: IFormCellProps<D, V>): JSX.Element => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-parent-form-id': `${props.parentFormId}`,
    'data-sha-parent-form-name': `${props.parentFormName}`,
  };

  if (isFormFullName(props.columnConfig.editFormId))
    attributes['data-sha-form-name'] = `${props.columnConfig.editFormId.module}/${props.columnConfig.editFormId.name}`;
  else if (typeof props.columnConfig.editFormId === 'string')
    attributes['data-sha-form-id'] = props.columnConfig.editFormId;

  return !props.columnConfig.editFormId
    ? <ReadFormCell {...props} />
    : (
      <FormCellRender formId={props.columnConfig.editFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div className={styles.shaFormCell} style={styleMinHeight}>
              <FormItemProvider labelCol={form.settings?.labelCol}>
                <ParentProvider model={MODE_READONLY_FALSE} formMode="edit" formFlatMarkup={form.flatStructure} isScope>
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

export const FormCell = <D extends object = object, V = number>(props: IFormCellProps<D, V>): JSX.Element => {
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
