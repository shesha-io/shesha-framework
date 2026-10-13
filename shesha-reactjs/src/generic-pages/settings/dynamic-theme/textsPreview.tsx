import { Space, Typography } from 'antd';
import { FC } from 'react';
import { useTheme } from '@/providers';
import { useStyles } from './styles/styles';

const TextsPreview: FC = () => {
  const { theme } = useTheme();
  const { styles } = useStyles();
  return (
    <Space orientation="vertical" size="middle" className={styles.space}>
      <Typography.Text style={{ color: theme.text?.default }}>
        Default text
      </Typography.Text>
      <Typography.Text type="secondary" style={{ color: theme.text?.secondary }}>
        Secondary text
      </Typography.Text>
      <Typography.Link style={{ color: theme.text?.link }}>Link text</Typography.Link>
    </Space>
  );
};

export default TextsPreview;
