import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Select, Tag } from 'antd';
import React, { FC, useMemo, useState, useEffect } from 'react';
import { executeScriptSync, SubFormProvider, useApplicationContext } from '../../../..';
import { useFormConfiguration } from 'providers/form/api';
import ChildEntitiesTagGroupModal from './modal';
import { IChildEntitiesTagGroupProps, IChildEntitiesTagGroupSelectOptions } from './models';
import './styles/index.less';
import { addChildEntitiesTagGroupOption, filterObjFromKeys } from './utils';
import { DataContextProvider } from 'providers/dataContextProvider/index';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { nanoid } from 'nanoid';

const { confirm } = Modal;

interface IProps {
  model: IChildEntitiesTagGroupProps;
  onChange?: Function;
  value?: any;
}

interface IState {
  activeValue?: IChildEntitiesTagGroupSelectOptions;
  open: boolean;
  options: IChildEntitiesTagGroupSelectOptions[];
  origin: object[] | object | null;
}

const INIT_STATE: IState = { open: false, options: [], origin: null };
const CONFIRM_DELETE_TITLE = 'Are you sure you want to delete this item?';
const WARNING_BIND_FORM = 'Please bind an appropriate form to this component.';

const ChildEntitiesTagGroupControl: FC<IProps> = ({ onChange, value, model }) => {
  const [state, setState] = useState<IState>(INIT_STATE);
  const { activeValue, open, options } = state;
  const { capturedProperties, deleteConfirmationBody, deleteConfirmationTitle, formId, labelFormat, propertyName } = model;

  const allData = useApplicationContext();

  const {
    formConfiguration,
    loading: isFetchingFormConfiguration,
    refetch: refetchFormConfig,
    error: formConfigurationError,
  } = useFormConfiguration({
    formId,
    lazy: true,
  });

  const calculateLabel = (value: any, func: string) => {
    return executeScriptSync(func, {...allData, item: value});
  };

  useEffect(() => {
    if (Array.isArray(value)) {
      const opts: IChildEntitiesTagGroupSelectOptions[] = [];
      value.forEach(item => {
        opts.push({
          label: calculateLabel(item, labelFormat),
          value: nanoid(),
          data: item
        });
      });
      setState((s) => ({ ...s, options: opts }));
    }
  }, [value]);

  useDeepCompareEffect(() => {
    if (formId) {
      refetchFormConfig();
    }
  }, [formId]);

  const setOpen = (open: boolean) => setState((s) => ({ ...s, open, activeValue: null }));

  const onModalChange = (value: any) => {
    setOption(
      {
        label: calculateLabel(value[propertyName], labelFormat),
        value: activeValue?.value ?? nanoid(),
        data: value[propertyName]
      }
    );
    setState((s) => ({ ...s, activeValue: null }));
  };

  const setOption = (option: IChildEntitiesTagGroupSelectOptions) => {
    const opts = addChildEntitiesTagGroupOption(state.options, option);
    setState((s) => ({ ...s, options:  opts}));

    onChange(opts.map(item => filterObjFromKeys(item.data, capturedProperties)));// morphTagGroup(opts, origin, capturedProperties));
  };

  const onClickTag = (val: IChildEntitiesTagGroupSelectOptions) => () => {
    setState((s) => ({ ...s, activeValue: val, open: true }));
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
      onOk: () => {
        const opts = options.filter(({ value }) => value !== item);
        setState((s) => ({ ...s, options: opts}));
        onChange(opts.map(item => filterObjFromKeys(item.data, capturedProperties)));
      },
    });

    /*onChange(
      morphTagGroup(
        options.filter(({ value }) => value !== item),
        origin,
        capturedProperties
      )
    );*/
  };

  const onOpenModal = () => {
    if (formConfiguration) {
      setOpen(true);
    } else {
      message.warning(WARNING_BIND_FORM);
    }
  };

  const tagRender = ({ label, value }) => {
    const val = options.find(x => x.value === value);
    return <Tag closable={isEditable} onClick={onClickTag(val)} onClose={onCloseTag(value)}>
      {label}
    </Tag>;
  };

  const isEditable = !model?.readOnly;
  const inputGroupProps = isEditable ? {} : { className: 'child-entity-tag-full-width' };

  const error = formConfigurationError;
  const loading = isFetchingFormConfiguration;

  const markup = useMemo(() => {
    return { components: formConfiguration?.markup, formSettings: formConfiguration?.settings};
  }, [formConfiguration]);

  return (
    <div className="child-entity-tag-container">
      {open && (
        <DataContextProvider id={propertyName} name={propertyName} description={propertyName} type={'childEntitiesTagGroup'} dynamicData={{[propertyName]: activeValue?.data}}>
          <SubFormProvider context={propertyName} propertyName={propertyName} markup={markup} >
            <ChildEntitiesTagGroupModal
              {...model}
              formInfo={formConfiguration}
              error={error}
              open={open}
              onToggle={setOpen}
              onSetData={setOption}
              loading={loading}
              onChange={onModalChange}
            />
          </SubFormProvider>
        </DataContextProvider>
      )}

      <Input.Group {...inputGroupProps}>
        <Select mode="tags" value={options} tagRender={tagRender} dropdownStyle={{ display: 'none' }} />
        {isEditable && <Button onClick={onOpenModal} className="child-entity-tag-add" icon={<PlusOutlined />} />}
      </Input.Group>
    </div>
  );
};

export default ChildEntitiesTagGroupControl;
