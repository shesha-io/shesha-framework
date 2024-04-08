import { IConfigurableItemBase } from '@/providers/itemListConfigurator/contexts';
import { TabPaneProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { EditMode, IConfigurableFormComponent } from '@/interfaces';

export interface ITabPaneProps
  extends IConfigurableItemBase,
    Omit<TabPaneProps, 'children' | 'tab' | 'style' | 'tabKey' | 'disabled'> {
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
}

export interface ITabsComponentProps extends IConfigurableFormComponent {
  tabs: ITabPaneProps[];
  size?: SizeType;
  defaultActiveKey?: string;
  tabType?: 'line' | 'card';
  permissions?: string[];
  hidden?: boolean;
  customVisibility?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}
