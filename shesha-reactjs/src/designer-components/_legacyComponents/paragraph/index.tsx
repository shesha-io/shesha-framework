import { FileTextOutlined } from '@ant-design/icons';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { ITextComponentProps } from '@/designer-components/text/models';
import TextComponent from '@/designer-components/text';

const ParagraphComponent: IToolboxComponent<ITextComponentProps> = {
  type: 'paragraph',
  isInput: false,
  name: 'Paragraph',
  icon: <FileTextOutlined />,
  tooltip: "Deprecated! Please use 'Text (Full)'",
  Factory: TextComponent.Factory,
};

export default ParagraphComponent;
