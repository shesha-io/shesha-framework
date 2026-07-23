import React, { FC, useMemo } from 'react';
import { Card, Typography } from 'antd';
import { ConfigurableForm } from '@/components/configurableForm';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { IConfigurableTheme, ThemeComponentGroup } from '@/providers/theme/contexts';
import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import { IToolboxComponent } from '@/interfaces';
import { isDefined } from '@/utils/nullables';
import { useStyles } from '../styles/styles';

export interface IComponentGroupPreviewProps {
  group: ThemeComponentGroup;
  theme: IConfigurableTheme;
}

/** Max number of representative components rendered in a group preview. */
const MAX_PREVIEW_COMPONENTS = 3;

/**
 * Live preview for a component-group tier. Renders a few representative components that declare
 * `themeGroup === group` through a real ConfigurableForm, so they flow through the same runtime style
 * merge as the canvas — picking up `theme[device].componentGroups[group]` and showing the group's
 * defaults applied. Editing the group settings updates `theme`, which re-renders this preview.
 */
export const ComponentGroupPreview: FC<IComponentGroupPreviewProps> = ({ group, theme }) => {
  const { styles } = useStyles();

  const previewComponents = useMemo((): IConfigurableFormComponent[] => {
    const definitions = getComponentDefinitions();
    const matches: IToolboxComponent[] = [];
    definitions.forEach((def) => {
      if (def.themeGroup === group && !def.isHidden) matches.push(def);
    });

    return matches
      .slice(0, MAX_PREVIEW_COMPONENTS)
      .map((def): IConfigurableFormComponent =>
        def.previewConfiguration ?? ({
          type: def.type,
          id: def.type,
          propertyName: `${def.type}Appearance`,
          label: `${def.name} Label`,
          parentId: 'root',
          hidden: false,
          version: 'latest',
        } as IConfigurableFormComponent),
      );
  }, [group]);

  const markup = useMemo((): FormMarkup => ({
    components: previewComponents,
    formSettings: {
      colon: theme.colon,
      layout: theme.layout,
      labelCol: { span: theme.labelSpan },
      wrapperCol: { span: theme.componentSpan },
    },
  } as FormMarkup), [previewComponents, theme.colon, theme.layout, theme.labelSpan, theme.componentSpan]);

  if (!isDefined(previewComponents) || previewComponents.length === 0) return null;

  return (
    <Card size="small" style={{ marginTop: 16 }}>
      <Typography.Title level={5} style={{ marginBottom: 12 }}>Preview</Typography.Title>
      <ConfigurableForm mode="edit" markup={markup} initialValues={theme} className={styles.appearanceForm} />
    </Card>
  );
};

export default ComponentGroupPreview;
