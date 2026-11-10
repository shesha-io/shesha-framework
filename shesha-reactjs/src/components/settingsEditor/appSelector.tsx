import { Select } from 'antd';
import { FC } from 'react';
import { useSettingsEditor } from './provider';
import { DefaultOptionType } from 'antd/es/select';
import { useStyles } from './styles/styles';

const GENERAL_VALUE = '-';
// Application keys are prefixed so none can be mistaken for General, whatever the key is.
const APP_VALUE_PREFIX = 'app:';
const toAppValue = (appKey: string): string => `${APP_VALUE_PREFIX}${appKey}`;

const AppSelector: FC = () => {
  const { selectApplication, applications, selectedApplication } = useSettingsEditor();
  const { styles } = useStyles();

  const onSelect = (value: string): void => {
    const app = value.startsWith(APP_VALUE_PREFIX)
      ? applications.find((a) => a.appKey === value.slice(APP_VALUE_PREFIX.length))
      : undefined;
    selectApplication(app);
  };

  // The selector has no label, so it always shows what is selected: General when no application is.
  const value = selectedApplication ? toAppValue(selectedApplication.appKey) : GENERAL_VALUE;

  const options: DefaultOptionType[] = [
    { label: "General", value: GENERAL_VALUE },
    ...applications.map((app) => ({ label: app.name, value: toAppValue(app.appKey) })),
  ];

  return (
    <Select<string> size="small" className={styles.shaSettingsAppSelector} value={value} onChange={onSelect} options={options} />
  );
};

export default AppSelector;
