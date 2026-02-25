import { FileTextOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { ITextComponentProps } from '@/designer-components/text/models';
import TypographyComponent from '@/designer-components/text/typography';

const ParagraphComponent: IToolboxComponent<ITextComponentProps> = {
  type: 'paragraph',
  isInput: false,
  name: 'Paragraph',
  icon: <FileTextOutlined />,
  tooltip: "Deprecated! Please use 'Text (Full)'",
  Factory: ({ model }) => <TypographyComponent {...model} />,
};

export default ParagraphComponent;
