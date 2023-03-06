import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Select, Tag } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { FormMode, useForm, useGlobalState } from '../../../..';
import JsonEntityModal from './modal';
import { IJsonEntityProps, IJsonEntitySelectOptions } from './models';
import './styles/index.less';
import { addJsonEntityOption, getInitJsonEntityOptions, morphJsonEntity } from './utils';

const { confirm } = Modal;

interface IProps {
  formMode?: FormMode;
  model: IJsonEntityProps;
  onChange?: Function;
}

interface IState {
  activeValue?: string;
  open: boolean;
  options: IJsonEntitySelectOptions[];
}

const INIT_STATE: IState = { open: false, options: [] };

const JsonEntityControl: FC<IProps> = ({ formMode: fMode, model, onChange }) => {
  const [state, setState] = useState<IState>(INIT_STATE);
  const { activeValue, open, options } = state;
  const { labelFormat, name } = model;

  const { globalState } = useGlobalState();

  const { form, formData } = useForm();

  useEffect(() => {
    if (form?.[name]) {
      setState(s => ({ ...s, options: getInitJsonEntityOptions(form?.[name], labelFromatExecutor()) }));
      onChange(morphJsonEntity(getInitJsonEntityOptions(form?.[name], labelFromatExecutor())));
    }
  }, []);

  const setOpen = (open: boolean) => setState(s => ({ ...s, open, activeValue: null }));

  const setOption = (option: IJsonEntitySelectOptions) => {
    setState(s => ({ ...s, options: addJsonEntityOption(s.options, option) }));

    onChange(morphJsonEntity(addJsonEntityOption(options, option)));
  };

  const onClickTag = (value: string) => () => {
    setState(s => ({ ...s, activeValue: value, open: true }));
  };

  const onCloseTag = (item: string) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();

    confirm({
      title: 'Are you sure delete this item?',
      icon: <ExclamationCircleOutlined />,
      content: 'Click yes to remove.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setState(s => ({ ...s, options: s.options.filter(({ value }) => value !== item) }));
      },
    });

    onChange(morphJsonEntity(options.filter(({ value }) => value !== item)));
  };

  const labelFromatExecutor = () => {
    if (!labelFormat) {
      return null;
    }

    return new Function('data, globalState', labelFormat)(formData, globalState);
  };

  const tagRender = ({ label, value }) => (
    <Tag closable={isEditable} onClick={onClickTag(value)} onClose={onCloseTag(value)}>
      {label}
    </Tag>
  );

  const isEditable = fMode !== 'readonly' && !model?.readOnly;
  const formMode = model?.readOnly ? 'readonly' : fMode;
  const inputGroupProps = isEditable ? {} : { className: 'json-entity-full-width' };

  return (
    <div className="json-entity-container">
      <JsonEntityModal
        {...model}
        formMode={formMode}
        open={open}
        onToggle={setOpen}
        onSetData={setOption}
        initialValues={options?.find(({ value }) => value === activeValue)}
        labelKey={labelFromatExecutor()}
      />
      <Input.Group {...inputGroupProps}>
        <Select mode="tags" value={options} tagRender={tagRender} dropdownStyle={{ display: 'none' }} />
        {isEditable && <Button onClick={() => setOpen(true)} className="json-entity-add" icon={<PlusOutlined />} />}
      </Input.Group>
    </div>
  );
};

export default JsonEntityControl;
