import React, { FC, useMemo } from 'react';
import { IDynamicActionsConfiguration } from './models';
import { ProviderSelector } from './providerSelector';
import { Form } from 'antd';
import { useDynamicActionsDispatcher, useForm } from '@/providers';
import { ProviderSettingsEditor } from './providerSettingsEditor';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IDynamicActionsConfiguratorProps {
  value?: IDynamicActionsConfiguration | undefined;
  onChange?: ((newValue: IDynamicActionsConfiguration) => void) | undefined;
  readOnly?: boolean | undefined;
  size?: SizeType | undefined;
}

const EMPTY_VALUE: IDynamicActionsConfiguration = {};

export const DynamicActionsConfigurator: FC<IDynamicActionsConfiguratorProps> = ({ value, onChange, readOnly, size }) => {
  const [form] = Form.useForm<IDynamicActionsConfiguration>();
  const { formSettings } = useForm();

  const { getProvider } = useDynamicActionsDispatcher();

  const onValuesChange = (_changedValues: Partial<IDynamicActionsConfiguration>, values: IDynamicActionsConfiguration): void => {
    if (onChange) {
      onChange(values);
    }
  };

  const providerUid = Form.useWatch('providerUid', form);
  const selectedProvider = useMemo(() => {
    return providerUid
      ? getProvider(providerUid)
      : null;
  }, [providerUid, getProvider]);

  return (
    <Form<IDynamicActionsConfiguration>
      component={false}
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      colon={formSettings?.colon ?? false}
      onValuesChange={onValuesChange}
      initialValues={value ?? EMPTY_VALUE}
      size={size}
    >
      <Form.Item name="providerUid" label="">
        <ProviderSelector readOnly={readOnly} />
      </Form.Item>
      {selectedProvider && selectedProvider.hasArguments && (
        <Form.Item name="settings" label={null}>
          <ProviderSettingsEditor
            provider={selectedProvider}
            readOnly={readOnly}
          />
        </Form.Item>
      )}
    </Form>
  );
};
