import { Modal, Spin } from 'antd';
import { ISettingsFormInstance, IToolboxComponent } from '@/interfaces';
import React, { useRef } from 'react';
import { useMedia } from 'react-use';
import { FormMarkupWithSettings, IConfigurableFormComponent } from '@/providers/form/models';
import { ComponentPropertiesEditor } from '@/components/formDesigner/componentPropertiesPanel/componentPropertiesEditor';

export interface IProps<T extends IConfigurableFormComponent> {
  model: T;
  isVisible: boolean;
  onSave: (model: T) => Promise<void>;
  onCancel: () => void;
  formComponent: IToolboxComponent;
  readOnly: boolean;
  propertyFilter?: (name: string) => boolean;
}

function ComponentSettingsModal<T extends IConfigurableFormComponent>({
  formComponent,
  isVisible,
  onSave,
  onCancel,
  readOnly,
  model,
  propertyFilter,
}: IProps<T>) {
  const isSmall = useMedia('(max-width: 480px)');
  const formRef = useRef<ISettingsFormInstance>();

  if (!formComponent)
    return null;

  const saving = false;

  const onCancelClick = () => {
    if (formRef.current)
      formRef.current.reset();
    onCancel();
  };

  const onOkClick = () => {
    if (formRef.current)
      formRef.current.submit();
  };

  function removeByProperty<T>(list: T[], property: keyof T, undesiredValue: any): T[] {
    return list.filter(item => item[property] !== undesiredValue);
  };

  const settingsFormMarkup = formComponent?.settingsFormMarkup as FormMarkupWithSettings;

  const updatedComponents = removeByProperty(settingsFormMarkup.components, 'propertyName', 'pnlStyle');

  const excludedStyleFormComponent = {
    ...formComponent,
    settingsFormMarkup: {
      ...formComponent.settingsFormMarkup,
      components: updatedComponents
    }
  } as IToolboxComponent<IConfigurableFormComponent>;

  return (
    <Modal
      width={isSmall ? '90%' : '60%'}
      open={isVisible}
      title="Settings"
      okText="Save"
      onCancel={onCancelClick}
      onOk={onOkClick}
      confirmLoading={saving}
      maskClosable={false}
    >
      <Spin spinning={saving} tip="Please wait...">
        {/* <ValidationErrors error={error?.data}></ValidationErrors> */}
        <ComponentPropertiesEditor
          componentModel={model}
          readOnly={readOnly}
          onSave={onSave}
          autoSave={false}
          toolboxComponent={excludedStyleFormComponent}
          formRef={formRef}
          propertyFilter={propertyFilter}
          layoutSettings={{
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
            layout: 'horizontal'
          }}
        />
      </Spin>
    </Modal>
  );
}

export default ComponentSettingsModal;