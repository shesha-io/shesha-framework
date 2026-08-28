import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { AppstoreOutlined } from '@ant-design/icons';

import DynamicView from './dynamicView';
import { getSettings } from './settings';

export type DynamicViewComponentProps = IConfigurableFormComponent;

/** @deprecated */
const DynamicViewComponent: IToolboxComponent<DynamicViewComponentProps> = {
  type: 'dynamicView',
  isInput: false,
  name: 'Dynamic View',
  icon: <AppstoreOutlined />,
  Factory: ({ model }) => {
    return (
      <DynamicView {...model} />
    );
  },
  settingsFormMarkup: getSettings,

};

export default DynamicViewComponent;
