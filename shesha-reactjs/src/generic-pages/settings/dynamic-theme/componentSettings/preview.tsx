import { ConfigurableForm } from "../../../../components/configurableForm";
import { FormMarkup, IConfigurableFormComponent, IConfigurableTheme } from "@/providers";
import React, { FC, useMemo } from "react";
import { useStyles } from "../styles/styles";
import { Card } from "antd";
import { IToolboxComponent } from "../../../../interfaces/formDesigner";

export interface IComponentDefaultsPreviewProps {
  componentDefinition: IToolboxComponent;
  theme: IConfigurableTheme;
}

export const ComponentDefaultsPreview: FC<IComponentDefaultsPreviewProps> = ({ componentDefinition, theme }) => {
  const { styles } = useStyles();

  const componentType = componentDefinition.type;
  const componentTitle = componentDefinition.name;

  const componentModel = useMemo((): IConfigurableFormComponent => {
    return componentDefinition?.previewConfiguration ?? {
      type: componentType,
      id: componentType,
      propertyName: `${componentType}Appearance`,
      label: `${componentTitle} Label`,
      parentId: 'root',
      hidden: false,
      version: 'latest',
    } as IConfigurableFormComponent;
  }, [componentDefinition, componentTitle, componentType]);

  const markup = useMemo((): FormMarkup => ({
    components: [componentModel],
    formSettings: {
      colon: theme.colon,
      layout: theme.layout,
      labelCol: { span: theme.labelSpan },
      wrapperCol: { span: theme.componentSpan },
    },
  } as FormMarkup), [componentModel, theme.colon, theme.layout, theme.labelSpan, theme.componentSpan]);

  return (
    <Card>
      <h4 style={{ marginBottom: 4 }}>{componentTitle} preview:</h4>
      <ConfigurableForm mode="edit" markup={markup} initialValues={theme ?? {}} className={styles.appearanceForm} />
    </Card>
  );
};
