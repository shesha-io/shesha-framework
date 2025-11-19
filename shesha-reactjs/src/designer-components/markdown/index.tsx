import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { IInputStyles } from '@/providers/form/models';
import { removeUndefinedProps } from '@/utils/object';
import { EditOutlined } from '@ant-design/icons';
import React, { CSSProperties } from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { IMarkdownProps } from './interfaces';
import Markdown from './markdown';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

const MarkdownComponent: IToolboxComponent<IMarkdownProps> = {
  type: 'markdown',
  name: 'Markdown',
  icon: <EditOutlined />,
  isInput: false,
  isOutput: true,
  Factory: ({ model }) => {
    const { allStyles, content: contentProp } = model;

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...allStyles?.stylingBoxAsCSS,
      ...allStyles?.borderStyles,
      ...allStyles?.fontStyles,
      ...allStyles?.backgroundStyles,
      ...allStyles?.shadowStyles,
      ...allStyles?.jsStyle,
    });

    return (
      <ConfigurableFormItem model={{ ...model, label: undefined, hideLabel: true }}>
        {(value) => {
          const content = contentProp || value;
          return (
            <div style={{ ...allStyles?.dimensionsStyles }}>
              <Markdown {...model} content={content} style={{ ...additionalStyles }} />
            </div>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => ({
    ...model,
    content: (model.content?.trim() ? model.content : `
# Markdown Example

## Basic Text
This is a paragraph with **bold text**, *italic text*, and ~~strikethrough text~~.

## Lists
- Bullet list item 1
- Bullet list item 2

1. Numbered list item 1
2. Numbered list item 2

## Links & Images
[Shesha](https://www.shesha.io)  
![Shesha Logo](https://raw.githubusercontent.com/shesha-io/shesha-framework/main/shesha-reactjs/public/images/app-logo.png)

## Code
Inline code: \`print("Hello, world!")\`

Block code:
\`\`\`python
def greet(name):
  return f"Hello, {name}!"

greet("world")
\`\`\``).trim(),
  }),
  migrator: (m) =>
    m
      .add<IMarkdownProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IMarkdownProps)
      .add<IMarkdownProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IMarkdownProps>(2, (prev) => {
        const styles: IInputStyles = {
          size: prev.size,
          hideBorder: prev.hideBorder,
          borderSize: prev.borderSize,
          borderRadius: prev.borderRadius,
          borderColor: prev.borderColor,
          fontSize: prev.fontSize,
          fontColor: prev.fontColor,
          backgroundColor: prev.backgroundColor,
        };
        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<IMarkdownProps>(3, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default MarkdownComponent;
