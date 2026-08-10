import { TabPaneProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { EditMode, IConfigurableFormComponent, IPropertySetting } from '@/interfaces';
import { TabPlacement } from 'antd/es/tabs';

export interface ITabPaneProps
  extends Omit<TabPaneProps, 'children' | 'tab' | 'style' | 'tabKey' | 'disabled'> {
  id: string;
  icon?: string;
  key: string;
  title: string;
  hidden?: boolean | IPropertySetting<boolean> | undefined;
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
  size?: SizeType | undefined;
  tabType?: 'line' | 'card' | undefined;
  hidden?: boolean | undefined;
  customVisibility?: string | undefined;
  position?: TabPlacement | undefined;
}
