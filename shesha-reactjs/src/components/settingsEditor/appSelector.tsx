import { Select } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import React, { FC } from 'react';
import { useSettingsEditor } from './provider';
import { DefaultOptionType } from 'antd/es/select';

export const AppSelector: FC = () => {
  const { selectApplication, applications } = useSettingsEditor();

  const onSelect = (value): void => {
    const app = applications.find((a) => a.appKey === value);
    selectApplication(app);
  };

  const options: DefaultOptionType[] = [
    { label: "General", value: "-" },
    ...applications.map((app) => ({ label: app.name, value: app.appKey })),
  ];

  return (
    <FormItem>
      <Select style={{ width: "100%" }} defaultValue="-" onChange={onSelect} options={options} />
    </FormItem>
  );
};

export default AppSelector;
