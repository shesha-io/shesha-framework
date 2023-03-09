import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Select, Tag } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { FormMode, useForm, useGlobalState } from '../../../..';
import ChildEntitiesTagGroupModal from './modal';
import { IChildEntitiesTagGroupProps, IChildEntitiesTagGroupSelectOptions } from './models';
import './styles/index.less';
import {
  addChildEntitiesTagGroupOption as addTagGroupOption,
  getInitChildEntitiesTagGroupOptions as getTagOptions,
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

const ChildEntitiesTagGroupControl: FC<IProps> = ({ formMode: fMode, model, onChange, value }) => {
  const [state, setState] = useState<IState>(INIT_STATE);
  const { activeValue, open, options, origin } = state;
  const { capturedProperties, deleteConfirmationBody, deleteConfirmationTitle, labelFormat, name } = model;

  const { globalState } = useGlobalState();

  const { form, formData } = useForm();

  useEffect(() => {
    const data = form?.[name] || value;

    if (data) {
      setState(s => ({ ...s, options: getTagOptions(data, labelFromatExecutor()), origin: data }));
      onChange(morphTagGroup(getTagOptions(data, labelFromatExecutor()), data, capturedProperties));
    }
  }, []);

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
      {open && (
        <ChildEntitiesTagGroupModal
          {...model}
          formMode={formMode}
          open={open}
          onToggle={setOpen}
          onSetData={setOption}
          initialValues={options?.find(({ value }) => value === activeValue)}
          labelKey={labelFromatExecutor()}
        />
      )}
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
