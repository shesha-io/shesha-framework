import { Select, Form } from 'antd';
import { FC } from 'react';
import { useSettingsEditor } from './provider';
import { DefaultOptionType } from 'antd/es/select';

export const AppSelector: FC = () => {
  const { selectApplication, applications } = useSettingsEditor();

  const onSelect = (value: string): void => {
    const app = applications.find((a) => a.appKey === value);
    selectApplication(app);
  };

  const options: DefaultOptionType[] = [
    { label: "General", value: "-" },
    ...applications.map((app) => ({ label: app.name, value: app.appKey })),
  ];

  return (
    <Form.Item>
      <Select<string> style={{ width: "100%" }} onChange={onSelect} options={options} />
    </Form.Item>
  );
};

export default AppSelector;
