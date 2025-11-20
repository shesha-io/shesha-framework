import { TabPaneProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { EditMode, IConfigurableFormComponent } from '@/interfaces';

export interface ITabPaneProps
  extends Omit<TabPaneProps, 'children' | 'tab' | 'style' | 'tabKey' | 'disabled'> {
  id: string;
  icon?: string;
  key: string;
  title: string;
  hidden?: boolean;
  permissions?: string[];
  components?: IConfigurableFormComponent[];
  childItems?: ITabPaneProps[];
  editMode?: EditMode;
  selectMode?: EditMode;
  readOnly?: boolean;

  label?: string;
  name?: string;
  tooltip?: string;
}

export interface IPropertiesTabsComponentProps extends IConfigurableFormComponent {
  tabs: ITabPaneProps[];
  size?: SizeType;
  defaultActiveKey?: string;
  tabType?: 'line' | 'card';
  hidden?: boolean;
  customVisibility?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}
