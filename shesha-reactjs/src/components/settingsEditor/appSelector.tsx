import { Select } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import React, { FC } from 'react';
import { useSettingsEditor } from './provider';

export const AppSelector: FC = () => {
  const { selectApplication, applications } = useSettingsEditor();

  const onSelect = (value): void => {
    const app = applications.find((a) => a.appKey === value);
    selectApplication(app);
  };

  return (
    <FormItem>
      <Select style={{ width: "100%" }} defaultValue="-" onChange={onSelect}>
        <Select.Option key="general" value="-">General</Select.Option>
        {applications.map((app) => <Select.Option key={app.appKey} value={app.appKey}>{app.name}</Select.Option>)}
      </Select>
    </FormItem>
  );
};

export default AppSelector;
