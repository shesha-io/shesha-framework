import { Space } from 'antd';

import { SwapOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { PERM_APP_CONFIGURATOR } from '@/shesha-constants';
import ProtectedContent from '@/components/protectedContent';
import AppEditModeToggler from '@/components/appConfigurator/editModeToggler';

const HeaderAppControl: IToolboxComponent = {
  type: 'headerAppControl',
  name: 'Header App Control',
  isInput: false,
  canBeJsSetting: false,
  icon: <SwapOutlined />,
  getWrapperStyle: () => ({ style: { dimensions: { width: 'auto' } } }),
  Factory: ({ model }) => {
    return model.hidden === true ? null : (
      <ProtectedContent permissionName={PERM_APP_CONFIGURATOR}>
        <Space className="sha-header-app-control">
          <AppEditModeToggler />
        </Space>
      </ProtectedContent>
    );
  },
  settingsFormMarkup: getSettings,

};

export default HeaderAppControl;
