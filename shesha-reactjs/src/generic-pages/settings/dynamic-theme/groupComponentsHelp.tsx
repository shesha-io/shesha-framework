import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FC, useMemo } from 'react';
import { ThemeComponentGroup } from '@/providers/theme/contexts';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useStyles } from './styles/styles';

export interface IGroupComponentsHelpProps {
  group: ThemeComponentGroup;
}

/**
 * Help icon for a style-group tab whose tooltip lists the components in that group: those whose
 * `themeGroup` is the group. Reads the registered toolbox, so components added by the application
 * are listed too.
 */
export const GroupComponentsHelp: FC<IGroupComponentsHelpProps> = ({ group }) => {
  const { styles } = useStyles();
  const components = useFormDesignerComponents();

  const names = useMemo(() => {
    const groupNames = Object.values(components)
      .filter((c) => c.themeGroup === group && c.isHidden !== true && c.showInThemeEditor !== false)
      .map((c) => c.name);
    return [...new Set(groupNames)].sort((a, b) => a.localeCompare(b));
  }, [components, group]);

  const content = names.length === 0
    ? 'No components use these defaults.'
    : (
      <div className={styles.groupComponentsHelp}>
        <div>Components that use these defaults:</div>
        <ul>
          {names.map((name) => <li key={name}>{name}</li>)}
        </ul>
      </div>
    );

  return (
    <Tooltip title={content}>
      <QuestionCircleOutlined className={styles.groupComponentsHelpIcon} />
    </Tooltip>
  );
};
