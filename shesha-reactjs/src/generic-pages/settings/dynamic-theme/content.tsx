import { Col, Radio } from 'antd';
import React, { FC, useState } from 'react';
import { CollapsiblePanel } from '@/components/panel';
import ThemeParameters from './parameters';
import { useStyles } from './styles/styles';
import { IConfigurableTheme } from '@/providers/theme';

export interface IConfigurableThemePageProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

export const ConfigurableThemeContent: FC<IConfigurableThemePageProps> = ({ value, onChange, readonly }) => {
  const { styles } = useStyles();
  const [themeLevel, setThemeLevel] = useState<1 | 2>(1);

  return (
    <Col span={24} className={styles.contentColumn}>
      <CollapsiblePanel
        collapsible="disabled"
        header={(
          <Radio.Group
            value={themeLevel}
            onChange={(e) => setThemeLevel(e.target.value as 1 | 2)}
            disabled={readonly}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value={1}>Theme</Radio.Button>
            <Radio.Button value={2}>Components</Radio.Button>
          </Radio.Group>
        )}
        className={styles.themeParameters}
      >
        <ThemeParameters value={value} onChange={onChange} readonly={readonly} themeLevel={themeLevel} />
      </CollapsiblePanel>
    </Col>
  );
};
