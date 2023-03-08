import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Select, Tag } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { FormMode, useForm, useGlobalState } from '../../../..';
import ChildEntitiesTagGroupModal from './modal';
import { IChildEntitiesTagGroupProps, IChildEntitiesTagGroupSelectOptions } from './models';
import './styles/index.less';
import {
  addChildEntitiesTagGroupOption,
  getInitChildEntitiesTagGroupOptions,
  morphChildEntitiesTagGroup,
} from './utils';

const { confirm } = Modal;

interface IProps {
  formMode?: FormMode;
  model: IChildEntitiesTagGroupProps;
  onChange?: Function;
}

interface IState {
  activeValue?: string;
  open: boolean;
  options: IChildEntitiesTagGroupSelectOptions[];
}

const INIT_STATE: IState = { open: false, options: [] };

const ChildEntitiesTagGroupControl: FC<IProps> = ({ formMode: fMode, model, onChange }) => {
  const [state, setState] = useState<IState>(INIT_STATE);
  const { activeValue, open, options } = state;
  const { labelFormat, name } = model;

  const { globalState } = useGlobalState();

  const { form, formData } = useForm();

  useEffect(() => {
    if (form?.[name]) {
      setState(s => ({ ...s, options: getInitChildEntitiesTagGroupOptions(form?.[name], labelFromatExecutor()) }));
      onChange(morphChildEntitiesTagGroup(getInitChildEntitiesTagGroupOptions(form?.[name], labelFromatExecutor())));
    }
  }, []);

  const setOpen = (open: boolean) => setState(s => ({ ...s, open, activeValue: null }));

  const setOption = (option: IChildEntitiesTagGroupSelectOptions) => {
    setState(s => ({ ...s, options: addChildEntitiesTagGroupOption(s.options, option) }));

    onChange(morphChildEntitiesTagGroup(addChildEntitiesTagGroupOption(options, option)));
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

    onChange(morphChildEntitiesTagGroup(options.filter(({ value }) => value !== item)));
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
  const inputGroupProps = isEditable ? {} : { className: 'child-entity-tag-full-width' };

  return (
    <div className="child-entity-tag-container">
      <ChildEntitiesTagGroupModal
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
        {isEditable && (
          <Button onClick={() => setOpen(true)} className="child-entity-tag-add" icon={<PlusOutlined />} />
        )}
      </Input.Group>
    </div>
  );
};

export default ChildEntitiesTagGroupControl;
