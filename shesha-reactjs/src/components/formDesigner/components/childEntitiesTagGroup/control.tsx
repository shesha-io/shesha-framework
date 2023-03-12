import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Select, Tag } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import {
  executeExpressionPayload as exe,
  FormMode,
  getStaticExecuteExpressionParams as exp,
  useForm,
  useGlobalState,
} from '../../../..';
import { useMetadataGet } from '../../../../apis/metadata';
import { useFormConfiguration } from '../../../../providers/form/api';
import ChildEntitiesTagGroupModal from './modal';
import { IChildEntitiesTagGroupProps, IChildEntitiesTagGroupSelectOptions } from './models';
import './styles/index.less';
import {
  addChildEntitiesTagGroupOption as addTagGroupOption,
  getInitChildEntitiesTagGroupOptions as getTagOptions,
  getLabelKeys,
  morphChildEntitiesTagGroup as morphTagGroup,
} from './utils';

const { confirm } = Modal;

interface IProps {
  formMode?: FormMode;
  model: IChildEntitiesTagGroupProps;
  onChange?: Function;
  value?: any;
}

interface IState {
  activeValue?: string;
  open: boolean;
  options: IChildEntitiesTagGroupSelectOptions[];
  origin: object[] | object | null;
}

const INIT_STATE: IState = { open: false, options: [], origin: null };
const CONFIRM_DELETE_TITLE = 'Are you sure you want to delete this item?';
const WARNING_BIND_FORM = 'Please bind an appropriate form to this component.';

const ChildEntitiesTagGroupControl: FC<IProps> = ({ formMode: fMode, model, onChange, value }) => {
  const [state, setState] = useState<IState>(INIT_STATE);
  const { activeValue, open, options, origin } = state;
  const { capturedProperties, deleteConfirmationBody, deleteConfirmationTitle, formId, labelFormat, name } = model;

  const { globalState } = useGlobalState();

  const { form, formData } = useForm();

  const {
    formConfiguration,
    loading: isFetchingFormConfiguration,
    refetch: refetchFormConfig,
    error: formConfigurationError,
  } = useFormConfiguration({
    formId,
    lazy: true,
  });

  const { data: metadata, loading: isFetchingMetada, refetch: refetchMetada, error: metadatError } = useMetadataGet({
    lazy: true,
  });

  useDeepCompareEffect(() => {
    const data = form?.[name] || value;

    if (data && metadata) {
      setState(s => ({
        ...s,
        options: getTagOptions(data, labelFromatExecutor, getLabelKeys(metadata)),
        origin: data,
      }));
      onChange(
        morphTagGroup(getTagOptions(data, labelFromatExecutor, getLabelKeys(metadata)), data, capturedProperties)
      );
    }
  }, [metadata]);

  useEffect(() => {
    if (formId) {
      refetchFormConfig();
    }
  }, [formId]);

  const container = formConfiguration?.modelType;

  useEffect(() => {
    if (container) {
      refetchMetada({ queryParams: { container } });
    }
  }, [container]);

  const setOpen = (open: boolean) => setState(s => ({ ...s, open, activeValue: null }));

  const setOption = (option: IChildEntitiesTagGroupSelectOptions) => {
    setState(s => ({ ...s, options: addTagGroupOption(s.options, option) }));

    onChange(morphTagGroup(addTagGroupOption(options, option), origin, capturedProperties));
  };

  const onClickTag = (value: string) => () => {
    setState(s => ({ ...s, activeValue: value, open: true }));
  };

  const onCloseTag = (item: string) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();

    confirm({
      title: deleteConfirmationTitle || CONFIRM_DELETE_TITLE,
      icon: <ExclamationCircleOutlined />,
      content: deleteConfirmationBody,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => setState(s => ({ ...s, options: s.options.filter(({ value }) => value !== item) })),
    });

    onChange(
      morphTagGroup(
        options.filter(({ value }) => value !== item),
        origin,
        capturedProperties
      )
    );
  };

  const onOpenModal = () => {
    if (formConfiguration) {
      setOpen(true);
    } else {
      message.warning(WARNING_BIND_FORM);
    }
  };

  const labelFromatExecutor = (dynamicParam?: object) => {
    try {
      if (!labelFormat) {
        return null;
      }

      if (dynamicParam) {
        return exe(
          new Function(exp('data, globalState, formMode', dynamicParam), labelFormat),
          dynamicParam || {},
          formData,
          globalState,
          formMode
        );
      }

      return new Function('data, globalState, formMode', labelFormat)(formData, globalState);
    } catch (_e) {
      return null;
    }
  };

  const tagRender = ({ label, value }) => (
    <Tag closable={isEditable} onClick={onClickTag(value)} onClose={onCloseTag(value)}>
      {label}
    </Tag>
  );

  const isEditable = fMode !== 'readonly' && !model?.readOnly;
  const formMode = model?.readOnly ? 'readonly' : fMode;
  const inputGroupProps = isEditable ? {} : { className: 'child-entity-tag-full-width' };

  const error = formConfigurationError || metadatError;
  const loading = isFetchingFormConfiguration || isFetchingMetada;

  return (
    <div className="child-entity-tag-container">
      {open && (
        <ChildEntitiesTagGroupModal
          {...model}
          data={formConfiguration}
          error={error}
          formMode={formMode}
          open={open}
          onToggle={setOpen}
          onSetData={setOption}
          labelKeys={getLabelKeys(metadata)}
          labelExecutor={labelFromatExecutor}
          loading={loading}
          initialValues={options?.find(({ value }) => value === activeValue)}
        />
      )}

      <Input.Group {...inputGroupProps}>
        <Select mode="tags" value={options} tagRender={tagRender} dropdownStyle={{ display: 'none' }} />
        {isEditable && <Button onClick={onOpenModal} className="child-entity-tag-add" icon={<PlusOutlined />} />}
      </Input.Group>
    </div>
  );
};

export default ChildEntitiesTagGroupControl;
