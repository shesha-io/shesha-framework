import { Select } from 'antd';
import { FC } from 'react';
import { useSettingsEditor } from './provider';
import { DefaultOptionType } from 'antd/es/select';
import { useStyles } from './styles/styles';

export const AppSelector: FC = () => {
  const { selectApplication, applications } = useSettingsEditor();
  const { styles } = useStyles();

  const onSelect = (value: string): void => {
    const app = applications.find((a) => a.appKey === value);
    selectApplication(app);
  };

  const options: DefaultOptionType[] = [
    { label: "General", value: "-" },
    ...applications.map((app) => ({ label: app.name, value: app.appKey })),
  ];

  return (
    <Select<string> size="small" className={styles.shaSettingsAppSelector} onChange={onSelect} options={options} />
  );
};

export default AppSelector;
