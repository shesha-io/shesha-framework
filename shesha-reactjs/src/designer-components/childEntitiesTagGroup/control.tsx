import ChildEntitiesTagGroupModal from './modal';
import React, { FC, useMemo, useState, useRef } from 'react';
import { Button, Space, App, Modal, Select, Tag } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { executeScriptSync, useAvailableConstantsData } from '@/providers/form/utils';
import { IChildEntitiesTagGroupProps, IChildEntitiesTagGroupSelectOptions } from './models';
import { nanoid } from '@/utils/uuid';
import { SubFormProvider } from '@/providers';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useFormConfiguration } from '@/providers/form/api';
import { useStyles } from './styles/styles';
import { useParent } from '@/providers/parentProvider/index';
import { useDeepCompareMemo } from '@/index';
import { DataContextProvider } from '@/providers/dataContextProvider/index';
import { getValueByPropertyName } from '@/utils/object';

const { confirm } = Modal;

interface IProps {
  componentName?: string;
  model: IChildEntitiesTagGroupProps;
  onChange?: Function;
  value?: any;
}

const CONFIRM_DELETE_TITLE = 'Are you sure you want to delete this item?';
const WARNING_BIND_FORM = 'Please bind an appropriate form to this component.';
const ERROR_LABEL = 'Please configure label configuration for this component.';

const ChildEntitiesTagGroupControl: FC<IProps> = ({ onChange, value, model }) => {
  const { styles } = useStyles();
  const [ open, setOpen ] = useState<boolean>(false);
  const activeValue = useRef<IChildEntitiesTagGroupSelectOptions>(null);
  const { deleteConfirmationBody, deleteConfirmationTitle, formId, labelFormat, propertyName, componentName } = model;

  const allData = useAvailableConstantsData();
  const parent = useParent();
  const { message } = App.useApp();

  const {
    formConfiguration,
    loading: isFetchingFormConfiguration,
    refetch: refetchFormConfig,
    error: formConfigurationError,
  } = useFormConfiguration({
    formId,
    lazy: true,
  });

  useDeepCompareEffect(() => {
    if (formId) {
      refetchFormConfig();
    }
  }, [formId]);

  const calculateLabel = (value: any, func: string, showError: boolean = false) => {
    try {
      return executeScriptSync(func, { ...allData, item: value });
    } catch {
      if (showError)
        message.error(ERROR_LABEL);
      return 'Not configured';
    }
  };

  const options = useDeepCompareMemo(() => {
    if (Array.isArray(value) && value.length) {
      const opts: IChildEntitiesTagGroupSelectOptions[] = [];
      value.forEach(item => {
        opts.push({
          label: calculateLabel(item, labelFormat),
          value: nanoid(),
          data: item
        });
      });
      return opts;
    }
    return [];
  }, [value]);

  const onModalChange = (value: any) => {
    const data = !!value ? getValueByPropertyName(value, propertyName) : undefined;
    const opt = activeValue.current
      ? options.map(item => item.value === activeValue.current.value ? data : item.data)
      : [...options.map(item => item.data), data];
    onChange(opt);    
  };

  const onClickTag = (val: IChildEntitiesTagGroupSelectOptions) => () => {
    activeValue.current = val;
    setOpen(true);
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
        onChange(opts.map(item => item.data));
      },
    });
  };

  const onOpenModal = () => {
    if (formConfiguration) {
        setOpen(true);
    } else {
      message.warning(WARNING_BIND_FORM);
    }
  };

  const onCloseModal = () => {
    activeValue.current = null;
    setOpen(false);
  };

  const isEditable = !model?.readOnly;

  const tagRender = ({ label, value }) => {
    const val = options.find(x => x.value === value);
    return <Tag closable={isEditable} onClick={onClickTag(val)} onClose={onCloseTag(value)}>
      {label}
    </Tag>;
  };

  const inputGroupProps = isEditable ? {} : { className: styles.childEntityTagFullWidth };

  const error = formConfigurationError;
  const loading = isFetchingFormConfiguration;

  const markup = useMemo(() => {
    return { components: formConfiguration?.markup, formSettings: formConfiguration?.settings };
  }, [formConfiguration]);

  const contextId = [parent?.subFormIdPrefix, propertyName].filter(x => !!x).join('.');

  const initData = useMemo(() => {
    return open ? new Promise<any>(resolve => resolve({ [propertyName]: {...activeValue.current?.data} })) : null;
  }, [propertyName, open ]);


  return (
    <div className={styles.childEntityTagContainer}>
      {open && (
        <DataContextProvider
          id={contextId}
          name={propertyName}
          description={propertyName}
          type='control'
          initialData={initData}
        >
          <SubFormProvider id={model.id} context={contextId} propertyName={propertyName} markup={markup} readOnly={model.readOnly} componentName={componentName}>
            <ChildEntitiesTagGroupModal
              {...model}
              contextId={contextId}
              formInfo={formConfiguration}
              error={error}
              open={open}
              onToggle={onCloseModal}
              loading={loading}
              onChange={onModalChange}
            />
          </SubFormProvider>
        </DataContextProvider>
      )}

      <Space.Compact style={{ width: "100%" }} {...inputGroupProps}>
        <Select mode="tags" value={options} tagRender={tagRender} dropdownStyle={{ display: 'none' }} searchValue='' />
        {isEditable && <Button onClick={onOpenModal} className={styles.childEntityTagAdd} icon={<PlusOutlined />} />}
      </Space.Compact>
    </div>
  );
};

export default ChildEntitiesTagGroupControl;
