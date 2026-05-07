import AttributeDecorator from '@/components/attributeDecorator';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { ConfigurableItemIdentifier } from '@/interfaces/configurableItems';
import { getFormForbiddenMessage, getFormNotFoundMessage } from '@/providers/configurationItemsLoader/utils';
import { useCrud } from "@/providers/crudContext/index";
import { ITableFormColumn } from '@/providers/dataTable/interfaces';
import { FormIdentifier, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { isFormFullName } from '@/providers/form/utils';
import { FormItemProvider } from '@/providers/formItem';
import { useFormById } from '@/providers/formManager/hooks';
import { UpToDateForm } from '@/providers/formManager/interfaces';
import ParentProvider from '@/providers/parentProvider/index';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { LoadingOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import axios from 'axios';
import React, { FC, ReactNode, useMemo } from 'react';
import { useStyles } from '../../styles/styles';
import { IConfigurableCellProps, IFormCellProps } from '../interfaces';
import { ComponentsContainerFormCell } from './componentsContainerFormCell';
import { getFormFullNameDisplayText } from '@/utils/form';

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
      : isDefined(formLoading.form)
        ? children(formLoading.form)
        : undefined;
};

type KnownAttributeNames = 'data-sha-datatable-cell-type' | 'data-sha-parent-form-id' | 'data-sha-parent-form-name' | 'data-sha-form-id' | 'data-sha-form-name';
type KnownAttributes = Partial<Record<KnownAttributeNames, string>>;

const fillFormIdAttribute = (attributes: KnownAttributes, formId: ConfigurableItemIdentifier | undefined): void => {
  if (isFormFullName(formId))
    attributes['data-sha-form-name'] = getFormFullNameDisplayText(formId);
  else if (!isNullOrWhiteSpace(formId))
    attributes['data-sha-form-id'] = formId;
};

const ReadFormCell = <D extends object = object, V = number>(props: IFormCellProps<D, V>): ReactNode => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes: KnownAttributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-parent-form-id': `${props.parentFormId}`,
    'data-sha-parent-form-name': `${props.parentFormName}`,
  };

  fillFormIdAttribute(attributes, props.columnConfig.displayFormId);

  return !props.columnConfig.displayFormId
    ? undefined
    : (
      <FormCellRender formId={props.columnConfig.displayFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div className={styles.shaFormCell} style={styleMinHeight}>
              <FormItemProvider labelCol={form.settings.labelCol}>
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
  parentFormId?: string | undefined;
  /** `Module`/`FormName` */
  parentFormName?: string | undefined;
}

export const CreateFormCell = (props: ICreateFormCellProps): ReactNode => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes: KnownAttributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-parent-form-name': `${props.parentFormName}`,
  };

  if (props.parentFormId)
    attributes['data-sha-parent-form-id'] = props.parentFormId;

  const { createFormId } = props.columnConfig;
  fillFormIdAttribute(attributes, createFormId);

  return !props.columnConfig.createFormId
    ? undefined
    : (
      <FormCellRender formId={props.columnConfig.createFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div
              className={styles.shaFormCell}
              style={styleMinHeight}
              {...(isFormFullName(createFormId) ? { "data-sha-form-name": getFormFullNameDisplayText(createFormId) } : {})}
            >
              <FormItemProvider labelCol={form.settings.labelCol}>
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

const EditFormCell = <D extends object = object, V = number>(props: IFormCellProps<D, V>): ReactNode => {
  const { styles } = useStyles();
  const styleMinHeight = useMemo(() => {
    return { minHeight: props.columnConfig.minHeight ?? 0 };
  }, [props.columnConfig.minHeight]);

  const attributes: KnownAttributes = {
    'data-sha-datatable-cell-type': 'subForm',
    'data-sha-parent-form-id': `${props.parentFormId}`,
    'data-sha-parent-form-name': `${props.parentFormName}`,
  };

  fillFormIdAttribute(attributes, props.columnConfig.editFormId);

  return !props.columnConfig.editFormId
    ? <ReadFormCell {...props} />
    : (
      <FormCellRender formId={props.columnConfig.editFormId}>
        {(form) => (
          <AttributeDecorator attributes={attributes}>
            <div className={styles.shaFormCell} style={styleMinHeight}>
              <FormItemProvider labelCol={form.settings.labelCol}>
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

export const FormCell = <D extends object = object, V = unknown>(props: IFormCellProps<D, V>): ReactNode => {
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
